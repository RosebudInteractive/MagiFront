'use strict';
const _ = require('lodash');
const { LANGUAGE_ID } = require('../const/sql-req-common');
const { DbObject } = require('./db-object');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

const TEST_REQ_TREE = {
    expr: {
        model: {
            name: "Test",
            childs: [
                {
                    dataObject: {
                        name: "Question",
                        childs: [
                            {
                                dataObject: {
                                    name: "Answer"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
};

const GET_TEST_TYPES_MSSQL =
    "select [Id], [Code], [Name], [Description] from [TestType]";

const GET_TEST_TYPES_MYSQL =
    "select `Id`, `Code`, `Name`, `Description` from `TestType`";

const GET_TEST_LIST_MSSQL =
    "select t.[Id], t.[TestTypeId], tt.[Name] TypeName, t.[CourseId], cl.[Name] CourseName,\n" +
    "  t.[LessonId], ll.[Name] LessonName, t.[Name], t.[Method], t.[MaxQ], t.[FromLesson], t.[Duration], t.[IsTimeLimited]\n" +
    "from[Test] t\n" +
    "  join[TestType] tt on tt.[Id] = t.[TestTypeId]\n" +
    "  left join[CourseLng] cl on cl.[CourseId] = t.[CourseId]\n" +
    "  left join[LessonLng] ll on ll.[LessonId] = t.[LessonId]\n" +
    "where <%= cond %>\n" +
    "order by t.[Id]";

const GET_TEST_LIST_MYSQL =
    "select t.`Id`, t.`TestTypeId`, tt.`Name` TypeName, t.`CourseId`, cl.`Name` CourseName,\n" +
    "  t.`LessonId`, ll.`Name` LessonName, t.`Name`, t.`Method`, t.`MaxQ`, t.`FromLesson`, t.`Duration`, t.`IsTimeLimited`\n" +
    "from`Test` t\n" +
    "  join`TestType` tt on tt.`Id` = t.`TestTypeId`\n" +
    "  left join`CourseLng` cl on cl.`CourseId` = t.`CourseId`\n" +
    "  left join`LessonLng` ll on ll.`LessonId` = t.`LessonId`\n" +
    "where <%= cond %>\n" +
    "order by t.`Id`";

const DbTest = class DbTest extends DbObject {

    constructor(options) {
        super(options);
    }

    _getObjById(id, expression, options) {
        var exp = expression || TEST_REQ_TREE;
        return super._getObjById(id, exp, options);
    }

    async getList(options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let data = [];
        let mysql_cond = "1=1";
        let mssql_cond = "1=1";
        let course_id;
        if (opts.course_id) {
            if (typeof (opts.course_id) === "string") {
                let id = parseInt(opts.course_id);
                if (!isNaN(id))
                    course_id = id;
            }
            else
                if (typeof (opts.course_id) === "number")
                    course_id = opts.course_id;
        }
        if (course_id) {
            mysql_cond = `t.${"`CourseId`"}=${course_id}`;
            mssql_cond = `t.[CourseId]=${course_id}`;
        }
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_TEST_LIST_MYSQL)({ cond: mysql_cond }),
                mssql: _.template(GET_TEST_LIST_MSSQL)({ cond: mssql_cond })
            }
        }, dbOpts);
        if (result && result.detail && (result.detail.length > 0)) {
            result.detail.forEach(elem => {
                elem.FromLesson = elem.FromLesson ? true : false;
                elem.IsTimeLimited = elem.IsTimeLimited ? true : false;
                data.push(elem);
            })
        }
        return data;
    }

    async getTypes(options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let data = {};
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(GET_TEST_TYPES_MYSQL)(),
                mssql: _.template(GET_TEST_TYPES_MSSQL)()
            }
        }, dbOpts);
        if (result && result.detail && (result.detail.length > 0)) {
            result.detail.forEach(elem => {
                data[elem.Id] = {
                    Id: elem.Id,
                    Code: elem.Code,
                    Name: elem.Name,
                    Description: elem.Description
                }
            })
        }
        return data;
    }

    async get(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let testObj = null;
        let testData = { Questions: [] };

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (root) => {
                    root_obj = root;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find test (Id = ${id}).`);

                    testObj = col.get(0);
                    testData.Id = testObj.id();
                    testData.TestTypeId = testObj.testTypeId();
                    testData.CourseId = testObj.courseId();
                    testData.LessonId = testObj.lessonId();
                    testData.Name = testObj.name();
                    testData.Method = testObj.method();
                    testData.MaxQ = testObj.maxQ();
                    testData.FromLesson = testObj.fromLesson();
                    testData.Duration = testObj.duration();
                    testData.IsTimeLimited = testObj.isTimeLimited();

                    let root_q = testObj.getDataRoot("Question");
                    col = root_q.getCol("DataElements");
                    if (col.count()) {
                        testData.Questions = new Array(col.count());
                        for (let i = 0; i < col.count(); i++) {
                            let obj = col.get(i);
                            let q = {
                                AnswTime: obj.answTime(),
                                Text: obj.text(),
                                Picture: obj.picture(),
                                PictureMeta: obj.pictureMeta(),
                                AnswType: obj.answType(),
                                Score: obj.score(),
                                StTime: obj.stTime(),
                                EndTime: obj.endTime(),
                                AllowedInCourse: obj.allowedInCourse(),
                                AnswBool: obj.answBool(),
                                AnswInt: obj.answInt(),
                                AnswText: obj.answText(),
                                CorrectAnswResp: obj.correctAnswResp(),
                                WrongAnswResp: obj.wrongAnswResp(),
                                Answers: []
                            };
                            testData.Questions[obj.number() - 1] = q;
                            let root_a = obj.getDataRoot("Answer");
                            let col_a = root_a.getCol("DataElements");
                            if (col_a.count()) {
                                q.Answers = new Array(col_a.count());
                                for (let j = 0; j < col_a.count(); j++) {
                                    let obj_a = col_a.get(j);
                                    let a = {
                                        Text: obj_a.text(),
                                        IsCorrect: obj_a.isCorrect()
                                    };
                                    q.Answers[obj_a.number() - 1] = a;
                                }
                            }
                        }
                    }
                    return testData;
                })
        }, memDbOptions);
    }

    async update(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let testObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find test (Id = ${id}).`);

                    testObj = col.get(0);
                    await root_obj.edit();

                    let fields = _.clone(inpFields);
                    delete fields.Questions;
                    this._setFieldValues(testObj, fields);

                    if (Array.isArray(inpFields.Questions)) {
                        let root_q = testObj.getDataRoot("Question");
                        let col_q = root_q.getCol("DataElements");
                        let q_list = {};
                        for (let i = 0; i < col_q.count(); i++) {
                            let obj = col_q.get(i);
                            q_list[obj.number()] = obj;
                        }
                        for (let i = 0; i < inpFields.Questions.length; i++) {
                            let fld = _.cloneDeep(inpFields.Questions[i]);
                            fld.Number = i + 1;
                            let answ = fld.Answers;
                            delete fld.Answers;
                            let list_obj = q_list[i + 1];
                            if (list_obj) {
                                this._setFieldValues(list_obj, fld);
                                delete q_list[i + 1];
                            }
                            else {
                                delete fld.Id;
                                let { newObject } = await root_q.newObject({ fields: fld }, dbOpts);
                                list_obj = this._db.getObj(newObject);
                           }
                            if (Array.isArray(answ)) {
                                let root_answ = list_obj.getDataRoot("Answer");
                                let col_a = root_answ.getCol("DataElements");
                                let a_list = {};
                                for (let j = 0; j < col_a.count(); j++) {
                                    let obj = col_a.get(j);
                                    a_list[obj.number()] = obj;
                                }
                                for (let j = 0; j < answ.length; j++) {
                                    let fld_a = _.clone(answ[j]);
                                    fld_a.Number = j + 1;
                                    let obj_a = a_list[j + 1];
                                    if (obj_a) {
                                        this._setFieldValues(obj_a, fld_a);
                                        delete a_list[j + 1];
                                    }
                                    else {
                                        delete fld_a.Id;
                                        await root_answ.newObject({ fields: fld_a }, dbOpts);
                                    }
                                }
                                for (let id in a_list)
                                    col_a._del(a_list[id]);
                            }
                        }
                        for (let id in q_list)
                            col_q._del(q_list[id]);
                    }

                    await root_obj.save(dbOpts);
                    return { result: "OK", id: id };
                })
        }, memDbOptions);
    }

    async insert(data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let inpFields = data || {};
        let testObj = null;
        let newId;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let fields = _.defaults(_.clone(inpFields), { LanguageId: LANGUAGE_ID });
                    delete fields.Questions;
                    delete fields.Id;

                    if (typeof (fields.TestTypeId) !== "number")
                        throw new Error(`Missing or invalid field "TestTypeId"`);
                    if (typeof (fields.Name) !== "string")
                        throw new Error(`Missing or invalid field "Name"`);
                    if (typeof (fields.Method) !== "number")
                        throw new Error(`Missing or invalid field "Method"`);

                    await root_obj.edit();
                    let newHandler = await root_obj.newObject({ fields: fields }, dbOpts);

                    newId = newHandler.keyValue;
                    testObj = this._db.getObj(newHandler.newObject);

                    if (Array.isArray(inpFields.Questions)) {
                        let root_q = testObj.getDataRoot("Question");
                        for (let i = 0; i < inpFields.Questions.length; i++) {
                            let fld = _.cloneDeep(inpFields.Questions[i]);
                            fld.Number = i + 1;
                            let answ = fld.Answers;
                            delete fld.Answers;
                            delete fld.Id;
                            if (typeof (fld.PictureMeta) !== "undefined")
                                fld.PictureMeta = typeof (fld.PictureMeta) === "string" ? fld.PictureMeta
                                    : JSON.stringify(fld.PictureMeta);
                            if (!fld.Text)
                                throw new Error(`Missing or invalid field "Text" in question #${i}.`);
                            if (!fld.AnswType)
                                throw new Error(`Missing or invalid field "AnswType" in question #${i}.`);
                            let { newObject } = await root_q.newObject({ fields: fld }, dbOpts);
                            if (Array.isArray(answ)) {
                                let root_answ = this._db.getObj(newObject).getDataRoot("Answer");
                                for (let j = 0; j < answ.length; j++) {
                                    let fld_a = _.clone(answ[j]);
                                    fld_a.Number = j + 1;
                                    if (typeof (fld_a.Text) !== "string")
                                        throw new Error(`Missing or invalid field "Text" in question #${i}, answer #${j}.`);
                                    if (typeof (fld_a.IsCorrect) !== "boolean")
                                        throw new Error(`Missing or invalid field "IsCorrect" in question #${i}, answer #${j}.`);
                                    await root_answ.newObject({ fields: fld_a }, dbOpts);
                                }
                            }
                        }
                    }

                    await root_obj.save(dbOpts);
                    return { result: "OK", id: newId };
                })
        }, memDbOptions);
    }

    async del(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let testObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, null, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find test (Id = ${id}).`);

                    testObj = col.get(0);
                    await root_obj.edit();
                    col._del(testObj);

                    await root_obj.save(dbOpts);
                    return { result: "OK", id: id };
                })
        }, memDbOptions);
    }
}

let dbTest = null;
exports.TestService = () => {
    return dbTest ? dbTest : dbTest = new DbTest();
}
