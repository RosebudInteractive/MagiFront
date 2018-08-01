'use strict';
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const mime = require('mime');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { ParserWordXML } = require('./parser-word-xml');
const { EpisodesService } = require("../db-episode");

const NUM_COLS = 3;
const TEXT_COL_IDX = 0;
const TIME_COL_IDX = 1;
const FILE_COL_IDX = 2;

const IMPOPT_OPTIONS_DFLT = {
    transcriptTimeMarks: true
};

const GET_LESSON_PIC_MSSQL =
    "select r.[Id], l.[MetaData] from [Resource] r\n" +
    "  join[ResourceLng] l on l.[ResourceId] = r.[Id]\n" +
    "where r.[ResType] = 'P' and  r.[LessonId] = <%= idLesson %>";

const GET_EPISODE_DURATION_MSSQL =
    "select el.[Duration] from[Episode] e\n" +
    "  join[EpisodeLng] el on el.[EpisodeId] = e.[Id]\n" +
    "where e.[Id] = <%= idEpisode %>";

const GET_LESSON_PIC_MYSQL =
    "select r.`Id`, l.`MetaData` from `Resource` r\n" +
    "  join`ResourceLng` l on l.`ResourceId` = r.`Id`\n" +
    "where r.`ResType` = 'P' and  r.`LessonId` = <%= idLesson %>";

const GET_EPISODE_DURATION_MYSQL =
    "select el.`Duration` from`Episode` e\n" +
    "  join`EpisodeLng` el on el.`EpisodeId` = e.`Id`\n" +
    "where e.`Id` = <%= idEpisode %>";

const RESOURCE_EXP = {
    expr: {
        model: {
            name: "Resource",
            childs: [
                {
                    dataObject: {
                        name: "ResourceLng"
                    }
                }
            ]
        }
    }
};

const { Import } = require('../../const/common');

exports.ImportEpisode = class ImportEpisode {
    constructor() {
        this._db = $memDataBase;
    }

    importEpisode(fileName, options) {
        let opts = _.defaultsDeep(options, IMPOPT_OPTIONS_DFLT);
        opts.importErrors = [];
        opts.importWarnings = [];
        let idLesson;
        let idEpisode;
        let self = this;
        let edtOptions = { dbRoots: [] };
        let root_obj = null;

        return new Promise((resolve) => {
            idLesson = parseInt(opts.idLesson);
            idEpisode = parseInt(opts.idEpisode);
            if (isNaN(idLesson))
                throw new Error(`Incorrect "idLesson" parameter: ${opts.idLesson}.`);
            if (isNaN(idEpisode))
                throw new Error(`Incorrect "idEpisode" parameter: ${opts.idEpisode}.`);
            delete opts.idLesson;
            delete opts.idEpisode;

            let parser = new ParserWordXML();
            resolve(parser.parseDocXMLFile(fileName));
        })
            .then((docData) => this._compileTable(docData, opts))
            .then((data) => {
                let episode = { Transcript: data.html, Toc: [], Content: [] };
                let result = episode;
                if (data.toc.length > 0) {
                    let toc = episode.Toc;
                    data.toc.forEach((elem) => {
                        toc.push({
                            Topic: elem.text,
                            StartTime: elem.ts
                        });
                    })
                }
                if (data.picts.length > 0) {
                    let duration;
                    result = $data.execSql({
                        dialect: {
                            mysql: _.template(GET_EPISODE_DURATION_MYSQL)({ idEpisode: idEpisode }),
                            mssql: _.template(GET_EPISODE_DURATION_MSSQL)({ idEpisode: idEpisode })
                        }
                    }, {})
                        .then((result) => {
                            if (!(result && result.detail && (result.detail.length === 1)))
                                throw new Error(`Episode (Id=${idEpisode}) doesn't exist.`);
                            duration = result.detail[0].Duration;

                            return Utils.editDataWrapper(() => {
                                return new MemDbPromise(self._db, (resolve, reject) => {
                                    var predicate = new Predicate(self._db, {});
                                    predicate
                                        .addCondition({ field: "ResType", op: "=", value: "P" })
                                        .addCondition({ field: "LessonId", op: "=", value: idLesson });

                                    let exp_filtered = Object.assign({}, RESOURCE_EXP);
                                    exp_filtered.expr.predicate = predicate.serialize(true);
                                    self._db._deleteRoot(predicate.getRoot());

                                    resolve(self._db.getData(Utils.guid(), null, null, exp_filtered, {}));
                                })
                                    .then((result) => {
                                        if (result && result.guids && (result.guids.length === 1)) {
                                            root_obj = self._db.getObj(result.guids[0]);
                                            if (!root_obj)
                                                throw new Error("ImportEpisode::importEpisode: Object doesn't exist: " + result.guids[0]);
                                        }
                                        else
                                            throw new Error("ImportEpisode::importEpisode: Invalid result of \"getData\": " + JSON.stringify(result));

                                        edtOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                        return root_obj.edit();
                                    })
                                    .then(() => {
                                        let picts = {};
                                        let collection = root_obj.getCol("DataElements");
                                        for (let i = 0; i < collection.count(); i++) {
                                            let resObj = collection.get(i);
                                            let lngCollection = resObj.getDataRoot("ResourceLng").getCol("DataElements");
                                            if (lngCollection && (lngCollection.count() === 1)) {
                                                let elem = lngCollection.get(0);
                                                try {
                                                    if (elem.metaData()) {
                                                        let meta = JSON.parse(elem.metaData());
                                                        if (meta.fileId)
                                                            picts[meta.fileId] = { id: resObj.id(), obj: elem, meta: meta, isUpdated: false };
                                                    }
                                                } catch (err) { };
                                            }
                                        }
                                        let content = episode.Content;
                                        data.picts[data.picts.length - 1].duration = duration * 1000 - data.picts[data.picts.length - 1].ts;
                                        data.picts.forEach((elem) => {
                                            elem.files.forEach((file) => {
                                                let item = { CompType: "PIC" };
                                                let pictData= picts[file.id];
                                                if (pictData) {
                                                    let meta = pictData.meta;
                                                    let pict = pictData.obj;
                                                    item.ResourceId = pictData.id;
                                                    item.StartTime = elem.ts;
                                                    item.Duration = elem.duration;
                                                    item.Content = { track: file.track, duration: elem.duration / 1000 };
                                                    if (!pict.isUpdated) {
                                                        if (file.title) {
                                                            pict.name(file.title);
                                                            meta.name = file.title;
                                                        }
                                                        if (file.title2) {
                                                            pict.description(file.title2);
                                                            meta.description = file.title2;
                                                        }
                                                        pict.isUpdated = true;
                                                        pict.metaData(JSON.stringify(meta));
                                                    }
                                                    let title = pict.name() ? pict.name() : null;
                                                    let title2 = pict.description() ? pict.description() : null;
                                                    if (title)
                                                        item.Content.title = title;
                                                    if (title2)
                                                        item.Content.title2 = title2;
                                                    item.Content = JSON.stringify(item.Content);
                                                    content.push(item);
                                                }
                                                else
                                                    opts.importErrors.push(`File id = ${file.id} ("${file.title}") doesn't exist in lesson.`);
                                            })
                                        });

                                        if (opts.importErrors.length > 0)
                                            throw new Error(`There are errors.`);

                                        return root_obj.save();
                                    })
                                    .then(() => {
                                        return episode;
                                    });
                            }, edtOptions);
                        });
                }
                return result;
            })
            .then((episode) => {
                return EpisodesService().update(idEpisode, idLesson, episode);
            })
            .then(() => {
                return opts.importWarnings.length > 0 ? { result: "WARN", warnings: opts.importWarnings } : { result: "OK" };
            })
            .catch((err) => {
                return { result: "ERROR", message: err.message, errors: opts.importErrors };
            });
    }

    _compileTable(docData, options) {
        let text = "";
        let html = "";
        let listType = null;
        let isFirstRow = true;
        let toc = [];
        let picts = [];
        let lastHeader = null;
        let isInParagraph = false;

        function getCellText(cell) {
            return cell.content.text.trim();
        }

        function parseFiles(cell, rowNum, colNum) {
            let fileList = getCellText(cell);
            let files = null;
            if (fileList.length > 0) {
                let filesArr = fileList.split(Import.FILE_LIST_SEPARATOR);
                let tracks = [];
                filesArr.forEach((fileRaw) => {
                    let file = fileRaw;
                    let idx = file.indexOf("[");
                    if (idx >= 0) {
                        // Hyperlink
                        if (idx === 0) file = ""
                        else
                            file = file.slice(0, idx - 1);
                    }
                    let name = file.trim();
                    let mimeType = mime.getType(name);
                    if (mimeType) {
                        let { name: fn } = path.parse(name);
                        name = fn;
                    }
                    let partArr = name.split(Import.FILE_FIELD_SEPARATOR);
                    if (partArr[0].length === 0)
                        partArr.splice(0, 1);
                    let title = null;
                    let title2 = null;
                    let id = null;
                    partArr.forEach((field) => {
                        let part = field.trim();
                        let match = part.match(/(id-)(.*)/i)
                        if (match) {
                            if (match.length >= 3)
                                id = match[2];
                        }
                        else {
                            if (!title)
                                title = part
                            else
                                if (!title2)
                                    title2 = part
                        }
                    });
                    if (id) {
                        let fileObj = { id: id, track: tracks.length + 1 };
                        tracks.push(fileObj);
                        if (title)
                            fileObj.title = title;
                        if (title2)
                            fileObj.title2 = title2;
                    }
                })
                if (tracks.length > 0) {
                    files = tracks;
                }
            }
            return files;
        }

        function parseTime(cell, rowNum, colNum) {
            let timeStr = getCellText(cell);
            let timeArr = timeStr.split(":");
            let sec = timeArr[timeArr.length - 1].split(".");
            if (sec.length > 1) {
                timeArr[timeArr.length - 1] = sec[0];
                timeArr.push(sec[1]);
            }
            else
                timeArr.push("0");

            let timeParts = [];
            for (let idx = 4; idx > 0; idx--) {
                let t = 0;
                if (timeArr.length >= idx) {
                    t = parseInt(timeArr[timeArr.length - idx]);
                    if (isNaN(t)) {
                        t = 0;
                        if (timeStr.length > 0)
                            throw new Error(`Invalid time format: "${timeStr}" in (${rowNum},${colNum}).`);
                    }
                }
                timeParts.push(t);
            }
            let timeMS = timeParts[0] * 1000 * 60 * 60 + timeParts[1] * 1000 * 60 + timeParts[2] * 1000 + timeParts[3];
            return { timeStr: timeStr, timeMS: timeMS };
        }

        function parseContent(content, checkHeader) {
            let html = "";
            content.paragraphs.forEach((prg) => {
                if (prg.props.numList) {
                    if (!listType) {
                        if (isInParagraph) {
                            html += `</p>`;
                            isInParagraph = false;
                        }
                        listType = prg.props.numList.numFmt;
                        html += listType === "bullet" ? `<ul>` : `<ol>`;;
                    }
                    html += `<li>${prg.html}</li>`;
                }
                else {
                    if (listType) {
                        html += listType === "bullet" ? `</ul>` : `</ol>`;
                        listType = null;
                    }
                    if ((typeof (checkHeader) === "function") && checkHeader()) {
                        if (isInParagraph) {
                            html += `</p>`;
                            isInParagraph = false;
                        }
                        html += `<h2>${prg.html}</h2>`;
                        lastHeader = { text: prg.text, ts: 0 };
                        toc.push(lastHeader);
                    }
                    else
                        if (!prg.props.notParagraph) {
                            if (isInParagraph)
                                html += `</p>`;
                            html += `<p>${prg.html}`
                        }
                        else
                            html += prg.html;
                }
            });
            return { textItem: content.text, htmlItem: html };
        }

        let rowNum = 1;
        let currPict = null;
        docData.Rows.forEach((row) => {
            if ((!isFirstRow) && (row.cells.length >= NUM_COLS)) {
                let cellTxt = row.cells[TEXT_COL_IDX];
                let { textItem, htmlItem } = parseContent(cellTxt.content, () => {
                    return (getCellText(row.cells[TIME_COL_IDX]) + getCellText(row.cells[FILE_COL_IDX])).length === 0;
                });
                let { timeStr, timeMS } = parseTime(row.cells[TIME_COL_IDX], rowNum, TIME_COL_IDX + 1);
                if (timeStr.length > 0) {
                    let files = parseFiles(row.cells[FILE_COL_IDX], rowNum, FILE_COL_IDX + 1);
                    if (files) {
                        let pict = { ts: timeMS, files: files };
                        if (currPict)
                            currPict.duration = pict.ts - currPict.ts;
                        picts.push(pict);
                        currPict = pict;
                    }
                    if (lastHeader) {
                        lastHeader.ts = timeMS;
                        lastHeader = null;
                    }
                    if (options.transcriptTimeMarks) {
                        if (htmlItem.match(/(<\/ol>|<\/ul>){0,1}<p>.*/))
                            htmlItem = htmlItem.replace(`<p>`, `<p><b><u>ts:{${timeStr}}</u></b>`)
                        else
                            htmlItem = `<b><u>ts:{${timeStr}}</u></b>${htmlItem}`;
                        textItem = `/r/nts:{${timeStr}}${textItem}`;
                    }
                }
                html += htmlItem;
                text += textItem;
            }
            isFirstRow = false;
            rowNum++;
        })
        if (isInParagraph) {
            html += `</p>`;
            isInParagraph = false;
        }
        if (listType) {
            html += listType === "bullet" ? `</ul>` : `</ol>`;
            listType = null;
        }

        // Foot notes processing
        //
        if (docData.FootNotes && (docData.FootNotes.used.length > 0)) {
            text += "\r\n\-------------------\r\n";
            html += "<p>&nbsp;</p>";
            listType = null;
            docData.FootNotes.used.forEach((note) => {
                let { textItem, htmlItem } = parseContent(note.content);
                html += htmlItem;
                text += textItem;
            })
            if (isInParagraph) {
                html += `</p>`;
                isInParagraph = false;
            }
            if (listType) {
                html += listType === "bullet" ? `</ul>` : `</ol>`;
                listType = null;
            }
        }
        return { text: text, html: html, toc: toc, picts: picts };
    }
}