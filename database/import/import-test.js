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
const { CacheableObject } = require('../../utils/cache-base');

const NUM_COLS = 3;
const TEXT_COL_IDX = 0;
const TIME_COL_IDX = 1;
const FILE_COL_IDX = 2;

const IMPOPT_OPTIONS_DFLT = {
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

const MAIN_TABLE_TITLE = /название\s*\(\s*теста\s*\)/gi;

const URL_TITLE = /url/gi;
const SN_POST_TITLE = /постинг/gi;
const SN_NAME_TITLE = /название/gi;
const SN_DESC_TITLE = /описание/gi;

const DFLT_QUESTION = {
    "AnswTime": 10,
    "Text": null,
    "Picture": null,
    "PictureMeta": null,
    "AnswType": null,
    "Score": 1,
    "StTime": 0,
    "EndTime": 0,
    "AllowedInCourse": false,
    "CorrectAnswResp": null,
    "WrongAnswResp": null,
    "AnswBool": null,
    "AnswInt": null,
    "AnswText": null,
    "Comment": null,
    "Answers": []
};

const FB_IMG_ID = "fb";
const TW_IMG_ID = "tw";

function getCellText(cell) {
    return cell.content.text.trim();
}

exports.ImportTest = class ImportTest {
    constructor() {
        this._db = $memDataBase;
    }

    import(fileName, options) {
        let opts = _.defaultsDeep(options, IMPOPT_OPTIONS_DFLT);
        opts.importErrors = [];
        opts.importWarnings = [];
        let idTest;
        let deleteInstances;
        let testService;
        let dbopts = typeof (opts.userId) === "number" ? { userId: opts.userId } : {};

        return new Promise(resolve => {
            testService = CacheableObject.getService("tests");
            idTest = parseInt(opts.idTest);
            if (isNaN(idTest))
                throw new Error(`Incorrect "idTest" parameter: ${opts.idTest}.`);
            delete opts.idTest;
            deleteInstances = typeof (opts.deleteInstances) === "boolean" ? opts.deleteInstances : JSON.parse(opts.deleteInstances);
            delete opts.deleteInstances;

            let parser = new ParserWordXML();
            resolve(parser.parseDocXMLFile(fileName));
        })
            .then(docData => this._compileTables(docData, opts))
            .then(testData => {
                if (deleteInstances)
                    testData.deleteInstances = true;
                return testService.update(idTest, testData, { dbOptions: dbopts });
            })
            .then(() => {
                return opts.importWarnings.length > 0 ? { result: "WARN", warnings: opts.importWarnings } : { result: "OK" };
            })
            .catch((err) => {
                return { result: "ERROR", message: err.message, errors: opts.importErrors };
            });
    }

    _compileTables(docData, options) {
        let rc = { General: null, Questions: null };
        docData.Tables.forEach((tbl) => {
            if ((tbl.rows.length > 1) && (tbl.rows[0].cells.length > 0)) {
                let title = getCellText(tbl.rows[0].cells[0]);
                docData.Rows = tbl.rows;
                if (title.match(MAIN_TABLE_TITLE)) {
                    rc.General = this._compileGeneralTable(docData, options);
                }
                else
                    rc.Questions = this._compileQuestionTable(docData, options);
            }
        })
        if (!rc.General)
            throw new Error("Missing test description table in the import file.")
        if (!rc.Questions)
            throw new Error("Missing test question table in the import file.")
        rc.General.Questions = rc.Questions;
        return rc.General;
    }

    _compileGeneralTable(docData, options) {
        let rc = {};
        let is_first_desc = true;
        docData.Rows.forEach((row) => {
            if (row.cells.length > 1) {
                let title = getCellText(row.cells[0]);
                if (title.match(MAIN_TABLE_TITLE))
                    rc.Name = getCellText(row.cells[1])
                else
                    if (title.match(SN_POST_TITLE))
                        rc.SnPost = getCellText(row.cells[1])
                    else
                        if (title.match(URL_TITLE))
                            rc.URL = getCellText(row.cells[1])
                        else
                            if (title.match(SN_NAME_TITLE))
                                rc.SnName = getCellText(row.cells[1])
                            else
                                if (title.match(SN_DESC_TITLE))
                                    if (is_first_desc) {
                                        rc.Description = getCellText(row.cells[1]);
                                        is_first_desc = false;
                                    }
                                    else
                                        rc.SnDescription = getCellText(row.cells[1]);
            }
        })
        return rc;
    }

    _compileQuestionTable(docData, options) {
        let rc = null;
        let curr_q = null;
        function nextQuestion() {
            if (curr_q) {
                if (!rc)
                    rc = [];
                if (!curr_q.AnswType) {
                    let cnt = 0;
                    for (let i = 0; i < curr_q.Answers.length; i++)
                        cnt += curr_q.Answers[i].IsCorrect ? 1 : 0;
                    if (cnt)
                        curr_q.AnswType = cnt === 1 ? 3 : 4;
                    if (!curr_q.AnswType)
                        throw new Error(`Undefined type of question "${curr_q.Text}"`);
                }
                rc.push(curr_q);
            }
            curr_q = null;
        }
        docData.Rows.forEach((row) => {
            if (row.cells.length >= 3) {
                let col1 = getCellText(row.cells[0]);
                let col2 = getCellText(row.cells[1]);
                let col3 = getCellText(row.cells[2]);
                if (!isNaN(parseInt(col1))) {
                    if (col2.length > 0) {
                        nextQuestion();
                        curr_q = _.defaultsDeep({ Text: col2 }, DFLT_QUESTION);
                    }
                    if ((col3.toLowerCase() === "верно") || (col3.toLowerCase() === "неверно")) {
                        curr_q.AnswType = 2;
                        curr_q.AnswBool = col3.toLowerCase() === "верно";
                    }
                }
                else
                    if (curr_q && (col2.length > 0)) {
                        if (col2.match(/<\s*фраза\s*при\s*верном\s*ответе\s*>/gi))
                            curr_q.CorrectAnswResp = col3
                        else
                            if (col2.match(/<\s*фраза\s*при\s*неверном\s*ответе\s*>/gi))
                                curr_q.WrongAnswResp = col3
                            else
                                if (!isNaN(parseInt(col3)))
                                    curr_q.Complexity = parseInt(col3)
                                else
                                    if (col3.toLowerCase() === "примечание")
                                        curr_q.Comment = col2
                                    else
                                        if (!curr_q.AnswType) {
                                            let is_correct = col3 === "+" ? true : (col3.length === 0 ? false : undefined);
                                            if (typeof (is_correct) === "boolean")
                                                curr_q.Answers.push({ Text: col2, IsCorrect: is_correct });
                                        }
                    }
            }
        })
        nextQuestion();
        return rc;
    }
}