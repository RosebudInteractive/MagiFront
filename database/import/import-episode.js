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
const { ParserWordXML, ParserConst } = require('./parser-word-xml');
const { EpisodesService } = require("../db-episode");

const NUM_COLS = 3;
const TEXT_COL_IDX = 0;
const TIME_COL_IDX = 1;
const FILE_COL_IDX = 2;

const IMPOPT_OPTIONS_DFLT = {
    transcriptTimeMarks: true
};

const GET_LESSON_PIC_MSSQL =
    "select r.[Id], r.[MetaData] from [Resource] r\n" +
    "where r.[ResType] = 'P' and  r.[LessonId] = <%= idLesson %>";

const GET_EPISODE_DURATION_MSSQL =
    "select el.[Duration] from[Episode] e\n" +
    "  join[EpisodeLng] el on el.[EpisodeId] = e.[Id]\n" +
    "where e.[Id] = <%= idEpisode %>";

const GET_LESSON_PIC_MYSQL =
    "select r.`Id`, r.`MetaData` from `Resource` r\n" +
    "where r.`ResType` = 'P' and  r.`LessonId` = <%= idLesson %>";

const GET_EPISODE_DURATION_MYSQL =
    "select el.`Duration` from`Episode` e\n" +
    "  join`EpisodeLng` el on el.`EpisodeId` = e.`Id`\n" +
    "where e.`Id` = <%= idEpisode %>";

const LESSON_REQ_TREE = {
    expr: {
        model: {
            name: "Lesson",
            childs: [
                {
                    dataObject: {
                        name: "LessonLng",
                        childs: [
                            {
                                dataObject: {
                                    name: "Reference"
                                }
                            },
                            {
                                dataObject: {
                                    name: "LessonMetaImage"
                                }
                            }
                        ]
                    }
                },
                {
                    dataObject: {
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
            ]
        }
    }
};

const { Import } = require('../../const/common');

const GEN_TABLE_TITLE = /описание\s*на\s*сайте/gi;
const CONTENT_TABLE_TITLE = /главы/gi;
const REF_TABLE_TITLE = /материалы/gi;

const SN_POST_TITLE = /текст\s*для\s*постинга/gi;
const SN_NAME_TITLE = /заголовок\s*для\s*сс/gi;
const SN_DESC_TITLE = /описание\s*для\s*сс/gi;

const FB_IMG_ID = "fb";
const TW_IMG_ID = "tw";

function getCellText(cell) {
    return cell.content.text.trim();
}

exports.ImportEpisode = class ImportEpisode {
    constructor() {
        this._db = $memDataBase;
    }

    import(fileName, options) {
        let opts = _.defaultsDeep(options, IMPOPT_OPTIONS_DFLT);
        opts.importErrors = [];
        opts.importWarnings = [];
        let dbopts = typeof (opts.userId) === "number" ? { userId: opts.userId } : {};
        let idLesson;
        let idEpisode;
        let self = this;
        let edtOptions = { dbRoots: [] };
        let root_obj = null;
        let lesson_obj = null;
        let image_root = null;
        let references = null;
        let refs_root = null;

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
            .then((docData) => this._compileTables(docData, opts))
            .then((resData) => {
                let data = resData.Content;
                references = resData.References;
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
                if (resData.General || (data.picts.length > 0)) {
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
                                        .addCondition({ field: "Id", op: "=", value: idLesson });

                                    let exp_filtered = Object.assign({}, LESSON_REQ_TREE);
                                    exp_filtered.expr.predicate = predicate.serialize(true);
                                    self._db._deleteRoot(predicate.getRoot());

                                    resolve(self._db.getData(Utils.guid(), null, null, exp_filtered, {}));
                                })
                                    .then((result) => {
                                        if (result && result.guids && (result.guids.length === 1)) {
                                            root_obj = self._db.getObj(result.guids[0]);
                                            if (!root_obj)
                                                throw new Error("ImportEpisode::import: Object doesn't exist: " + result.guids[0]);
                                        }
                                        else
                                            throw new Error("ImportEpisode::import: Invalid result of \"getData\": " + JSON.stringify(result));

                                        edtOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                                        let col = root_obj.getCol("DataElements");
                                        if (col.count() !== 1)
                                            throw new Error(`Lesson (Id = ${idLesson}) doesn't exist.`);
                                        lesson_obj = col.get(0);
                                        return root_obj.edit();
                                    })
                                    .then(() => {
                                        let picts = {};
                                        let images = [];
                                        let collection = lesson_obj.getDataRoot("Resource").getCol("DataElements");
                                        for (let i = 0; i < collection.count(); i++) {
                                            let resObj = collection.get(i);
                                            if (resObj.resType() === "P") {
                                                let lngCollection = resObj.getDataRoot("ResourceLng").getCol("DataElements");
                                                if (lngCollection && (lngCollection.count() === 1)) {
                                                    let elem = lngCollection.get(0);
                                                    try {
                                                        if (resObj.metaData()) {
                                                            let meta = JSON.parse(resObj.metaData());
                                                            if (meta.fileId)
                                                                picts[meta.fileId] = {
                                                                    id: resObj.id(),
                                                                    obj: { res: resObj, lng: elem },
                                                                    meta: meta,
                                                                    isUpdated: false
                                                                };
                                                        }
                                                    } catch (err) { };
                                                }
                                            }
                                        }
                                        let content = episode.Content;
                                        if (data.picts.length > 0)
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
                                                            pict.lng.name(file.title);
                                                            meta.name = file.title;
                                                        }
                                                        else {
                                                            pict.lng.name("");
                                                            meta.name = "";
                                                        }
                                                        if (file.title2) {
                                                            pict.lng.description(file.title2);
                                                            meta.description = file.title2;
                                                        }
                                                        else {
                                                            pict.lng.description(null);
                                                            delete meta.description;
                                                        }
                                                        pict.isUpdated = true;
                                                        pict.res.metaData(JSON.stringify(meta));
                                                    }
                                                    if (file.title)
                                                        item.Content.title = file.title;
                                                    if (file.title2)
                                                        item.Content.title2 = file.title2;
                                                    item.Content = JSON.stringify(item.Content);
                                                    content.push(item);
                                                }
                                                else
                                                    opts.importErrors.push(`File id = ${file.id} ("${file.title}") doesn't exist in lesson.`);
                                            })
                                        });

                                        let col = lesson_obj.getDataRoot("LessonLng").getCol("DataElements");
                                        if (col.count() !== 1)
                                            throw new Error(`Inconsistent "LessonLng" part of lesson (Id = ${idLesson}).`);
                                        let lessonLng = col.get(0);

                                        //
                                        // SN pictures processing 
                                        //
                                        image_root = lessonLng.getDataRoot("LessonMetaImage");
                                        col = image_root.getCol("DataElements");
                                        let metaImg = {};
                                        for (let i = 0; i < col.count(); i++){
                                            let el = col.get(i);
                                            switch (el.type()) {
                                                case "og":
                                                    metaImg["og"] = el;
                                                    break;
                                                case "twitter":
                                                    metaImg["twitter"] = el;
                                                    break;
                                            }
                                        }

                                        [{ id: FB_IMG_ID, tp: "og" }, { id: TW_IMG_ID, tp: "twitter" }].forEach((elem) => {
                                            let img = picts[elem.id];
                                            if (img) {
                                                let el = metaImg[elem.tp];
                                                if (el)
                                                    el.resourceId(img.id)
                                                else
                                                    images.push({ Type: elem.tp, ResourceId: img.id });
                                            }
                                        });

                                        if (references) {
                                            refs_root = lessonLng.getDataRoot("Reference");
                                            col = refs_root.getCol("DataElements");
                                            while (col.count() > 0)
                                                col._del(col.get(0));
                                        }

                                        if (resData.General) {
                                            lessonLng.shortDescription(resData.General.shortDescription);
                                            lessonLng.snPost(resData.General.snPost);
                                            lessonLng.snName(resData.General.snName);
                                            lessonLng.snDescription(resData.General.snDescription);
                                        }

                                        if (opts.importErrors.length > 0)
                                            throw new Error(`There are errors.`);

                                        return images;
                                    })
                                    .then((images) => {
                                        if (images.length > 0) {
                                            return Utils.seqExec(images, (elem) => {
                                                return image_root.newObject({
                                                    fields: elem
                                                }, {})                                            })
                                        }
                                    })
                                    .then(() => {
                                        if (references && (references.length > 0)) {
                                            let num = 0;
                                            return Utils.seqExec(references, (elem) => {
                                                let fields = {
                                                    Number: ++num,
                                                    Description: elem.text,
                                                    Recommended: false
                                                }
                                                if (elem.url)
                                                    fields.URL = elem.url;
                                                return refs_root.newObject({
                                                    fields: fields
                                                }, {})
                                            })
                                        }
                                    })
                                    .then(() => {
                                        return root_obj.save(dbopts);
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
                return EpisodesService().update(idEpisode, idLesson, episode, dbopts);
            })
            .then(() => {
                return opts.importWarnings.length > 0 ? { result: "WARN", warnings: opts.importWarnings } : { result: "OK" };
            })
            .catch((err) => {
                return { result: "ERROR", message: err.message, errors: opts.importErrors };
            });
    }

    _compileTables(docData, options) {
        let rc = { General: null, Content: null, References: null };
        docData.Tables.forEach((tbl) => {
            if ((tbl.rows.length > 1) && (tbl.rows[0].cells.length > 0)) {
                let title = getCellText(tbl.rows[0].cells[0]);
                docData.Rows = tbl.rows;
                if (title.match(GEN_TABLE_TITLE)) {
                    rc.General = this._compileGeneralTable(docData, options);
                }
                else
                    if (title.match(CONTENT_TABLE_TITLE)) {
                        rc.Content = this._compileContentTable(docData, options);
                    }
                    else
                        if (title.match(REF_TABLE_TITLE)) {
                            rc.References = this._compileRefTable(docData, options);
                        }
            }
        })
        if (!rc.Content)
            throw new Error("Missing episode content table in the import file.")
        return rc;
    }

    _compileRefTable(docData, options) {
        let rc = [];
        let isFirst = true;
        docData.Rows.forEach((row) => {
            if ((!isFirst) && (row.cells.length > 0)) {
                let item = getCellText(row.cells[0]);
                let match = item.match(/(.*?)\[\[(.*?)\]\]/i);
                if (match && (match.length === 3))
                    item = { text: match[1].trim(), url: match[2].trim() }
                else
                    item = { text: item };
                rc.push(item);
            }
            isFirst = false;
        })
        return rc;
    }

    _compileGeneralTable(docData, options) {
        let rc = {
            shortDescription: null,
            snPost: null,
            snName: null,
            snDescription: null
        };
        docData.Rows.forEach((row) => {
            if (row.cells.length > 1) {
                let title = getCellText(row.cells[0]);
                if (title.match(GEN_TABLE_TITLE))
                    rc.shortDescription = getCellText(row.cells[1])
                else
                    if (title.match(SN_POST_TITLE))
                        rc.snPost = getCellText(row.cells[1])
                    else
                        if (title.match(SN_NAME_TITLE))
                            rc.snName = getCellText(row.cells[1])
                        else
                            if (title.match(SN_DESC_TITLE))
                                rc.snDescription = getCellText(row.cells[1])
            }            
        })
        return rc;
    }

    _compileContentTable(docData, options) {
        let text = "";
        let html = "";
        let listType = null;
        let isFirstRow = true;
        let toc = [];
        let picts = [];
        let lastHeader = null;
        let isInParagraph = false;

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
                            isInParagraph = true;
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
            text += ParserConst.Text_LF + "-------------------" + ParserConst.Text_LF;
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