'use strict';
const _ = require('lodash');
const { LANGUAGE_ID } = require('../const/sql-req-common');
const { DbObject } = require('./db-object');
const { HttpError } = require('../errors/http-error');
const { HttpCode } = require("../const/http-codes");
const { DbUtils } = require('./db-utils');
const { splitArray } = require('../utils');
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
                },
                {
                    dataObject: {
                        name: "TestMetaImage"
                    }
                }
            ]
        }
    }
};

const TEST_INST_REQ_TREE = {
    expr: {
        model: {
            name: "TestInstance",
            childs: [
                {
                    dataObject: {
                        name: "InstanceQuestion"
                    }
                }
            ]
        }
    }
};

const GET_QUISTIONS_REQ_TREE = {
    expr: {
        model: {
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
};

const GET_TEST_TYPES_MSSQL =
    "select [Id], [Code], [Name], [Description] from [TestType]";

const GET_TEST_TYPES_MYSQL =
    "select `Id`, `Code`, `Name`, `Description` from `TestType`";

const GET_TEST_LIST_MSSQL =
    "select t.[Id], t.[TestTypeId], tt.[Name] TypeName, t.[Status], t.[CourseId], cl.[Name] CourseName,\n" +
    "  t.[LessonId], ll.[Name] LessonName, t.[Name], t.[Method], t.[MaxQ], t.[FromLesson], t.[Duration], t.[IsTimeLimited],\n" +
    "  coalesce(count(q.[Id]), 0) Nq\n" +
    "from[Test] t\n" +
    "  join[TestType] tt on tt.[Id] = t.[TestTypeId]\n" +
    "  left join[CourseLng] cl on cl.[CourseId] = t.[CourseId]\n" +
    "  left join[LessonLng] ll on ll.[LessonId] = t.[LessonId]\n" +
    "  left join[Question] q on q.[TestId] = t.[Id]\n" +
    "where <%= cond %>\n" +
    "group by t.[Id], t.[TestTypeId], tt.[Name], t.[Status], t.[CourseId], cl.[Name], t.[LessonId], ll.[Name], t.[Name],\n" +
    "  t.[Method], t.[MaxQ], t.[FromLesson], t.[Duration], t.[IsTimeLimited]\n" +
    "order by t.[Id]";

const GET_TEST_LIST_MYSQL =
    "select t.`Id`, t.`TestTypeId`, tt.`Name` TypeName, t.`Status`, t.`CourseId`, cl.`Name` CourseName,\n" +
    "  t.`LessonId`, ll.`Name` LessonName, t.`Name`, t.`Method`, t.`MaxQ`, t.`FromLesson`, t.`Duration`, t.`IsTimeLimited`,\n" +
    "  coalesce(count(q.`Id`), 0) Nq\n" +
    "from`Test` t\n" +
    "  join`TestType` tt on tt.`Id` = t.`TestTypeId`\n" +
    "  left join`CourseLng` cl on cl.`CourseId` = t.`CourseId`\n" +
    "  left join`LessonLng` ll on ll.`LessonId` = t.`LessonId`\n" +
    "  left join`Question` q on q.`TestId` = t.`Id`\n" +
    "where <%= cond %>\n" +
    "group by t.`Id`, t.`TestTypeId`, tt.`Name`, t.`Status`, t.`CourseId`, cl.`Name`, t.`LessonId`, ll.`Name`, t.`Name`,\n" +
    "  t.`Method`, t.`MaxQ`, t.`FromLesson`, t.`Duration`, t.`IsTimeLimited`\n" +
    "order by t.`Id`";

const GET_QUESTION_IDS_MSSQL =
    "select q.[Id] from [Test] t\n" +
    "  join [Question] q on q.[TestId] = t.[Id]\n" +
    "where (t.[Status] = 2) and (t.[CourseId] = <%= course_id %>) and (not t.[LessonId] is NULL)";

const GET_QUESTION_IDS_MYSQL =
    "select q.`Id` from `Test` t\n" +
    "  join `Question` q on q.`TestId` = t.`Id`\n" +
    "where (t.`Status` = 2) and (t.`CourseId` = <%= course_id %>) and (not t.`LessonId` is NULL)";

const TEST_MSSQL_PUBLIC_REQ =
    "select t.[Id], t.[LanguageId], t.[TestTypeId], t.[CourseId], t.[LessonId], t.[Name], t.[Method],\n" +
    "  t.[MaxQ], t.[FromLesson], t.[Duration], t.[IsTimeLimited], t.[Status], t.[Cover], t.[CoverMeta], t.[URL],\n" +
    "  t.[SnPost], t.[SnDescription], t.[SnName], q.[AnswTime], c.[URL] CourseURL, cl.[Name] CourseName,\n" +
    "  l.[URL] LsnURL, ll.[Name] LsnName\n" +
    "from [Test] t\n" +
    "  join [Question] q on q.[TestId] = t.[Id]\n" +
    "  left join [Course] c on c.[Id] = t.[CourseId]\n" +
    "  left join [CourseLng] cl on cl.[CourseId] = t.[CourseId]\n" +
    "  left join [Lesson] l on l.[Id] = t.[LessonId]\n" +
    "  left join [LessonLng] ll on ll.[LessonId] = t.[LessonId]\n" +
    "<%= where %>\n" +
    "order by t.[Id]";

const TEST_MSSQL_PUBLIC_WHERE_URL =
    "where t.[URL] = '<%= courseUrl %>'";
const TEST_MSSQL_PUBLIC_WHERE_ID =
    "where t.[Id] = <%= id %>";
const TEST_MSSQL_IMG_REQ =
    "select [Id], [Type], [FileName], [MetaData] from [TestMetaImage] where [TestId] = <%= id %>";

const TEST_MYSQL_PUBLIC_REQ =
    "select t.`Id`, t.`LanguageId`, t.`TestTypeId`, t.`CourseId`, t.`LessonId`, t.`Name`, t.`Method`,\n" +
    "  t.`MaxQ`, t.`FromLesson`, t.`Duration`, t.`IsTimeLimited`, t.`Status`, t.`Cover`, t.`CoverMeta`, t.`URL`,\n" +
    "  t.`SnPost`, t.`SnDescription`, t.`SnName`, q.`AnswTime`, c.`URL` CourseURL, cl.`Name` CourseName,\n" +
    "  l.`URL` LsnURL, ll.`Name` LsnName\n" +
    "from `Test` t\n" +
    "  join `Question` q on q.`TestId` = t.`Id`\n" +
    "  left join `Course` c on c.`Id` = t.`CourseId`\n" +
    "  left join `CourseLng` cl on cl.`CourseId` = t.`CourseId`\n" +
    "  left join `Lesson` l on l.`Id` = t.`LessonId`\n" +
    "  left join `LessonLng` ll on ll.`LessonId` = t.`LessonId`\n" +
    "<%= where %>\n" +
    "order by t.`Id`";

const TEST_MYSQL_PUBLIC_WHERE_URL =
    "where t.`URL` = '<%= courseUrl %>'";
const TEST_MYSQL_PUBLIC_WHERE_ID =
    "where t.`Id` = <%= id %>";
const TEST_MYSQL_IMG_REQ =
    "select `Id`, `Type`, `FileName`, `MetaData` from `TestMetaImage` where `TestId` = <%= id %>";

const DFLT_QUESTION_SCORE = 1;
const DFLT_ANSW_TIME = 10;
const MAX_QUESTIONS_REQ_LEN = 10;

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

    async getPublic(url, user, options) {
        let opts = options || {};
        let isAbsPath = opts.abs_path && ((opts.abs_path === "true") || (opts.abs_path === true)) ? true : false;
        let dLink = opts.dlink && ((opts.dlink === "true") || (opts.dlink === true)) ? true : false;

        let id = url;
        let isInt = (typeof (id) === "number");
        if (isInt && isNaN(id))
            throw new Error(`Invalid argument "url": ${url}.`);
        if (!isInt)
            if (typeof (id) === "string") {
                let res = id.match(/[0-9]*/);
                if (res && (id.length > 0) && (res[0].length === id.length)) {
                    id = parseInt(id);
                    isInt = true;
                }
            }
            else
                throw new Error(`Invalid argument "url": ${url}.`);

        let whereMSSQL = isInt ? _.template(TEST_MSSQL_PUBLIC_WHERE_ID)({ id: id })
            : _.template(TEST_MSSQL_PUBLIC_WHERE_URL)({ courseUrl: id })
        let whereMYSQL = isInt ? _.template(TEST_MYSQL_PUBLIC_WHERE_ID)({ id: id })
            : _.template(TEST_MYSQL_PUBLIC_WHERE_URL)({ courseUrl: id })

        let result = await $data.execSql({
            dialect: {
                mysql: _.template(TEST_MYSQL_PUBLIC_REQ)({ where: whereMYSQL }),
                mssql: _.template(TEST_MSSQL_PUBLIC_REQ)({ where: whereMSSQL })
            }
        }, {});
        let testData = { Questions: [], Images: {} };
        if (result && result.detail && (result.detail.length > 0)) {
            result.detail.forEach(elem => {
                if (!testData.Id) {
                    for (let fld in elem) {
                        if (fld !== "AnswTime")
                            testData[fld] = elem[fld];
                    }
                    testData.IsTimeLimited = elem.IsTimeLimited ? true : false;
                    testData.FromLesson = elem.FromLesson ? true : false;
                    testData.URL = isAbsPath ? this._absTestUrl + elem.URL : elem.URL;
                    testData.CourseURL = elem.CourseURL && isAbsPath ? this._absCourseUrl + elem.CourseURL : elem.CourseURL;
                    testData.LsnURL = elem.LsnURL && isAbsPath ? this._baseUrl + elem.CourseURL + '/' + elem.LsnURL : elem.LsnURL;
                    testData.Cover = this._convertDataUrl(elem.Cover, isAbsPath, dLink);
                    testData.CoverMeta = this._convertMeta(elem.CoverMeta, isAbsPath, dLink);
                }
                testData.Questions.push(elem.AnswTime);
            });
        }
        else
            throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find test "${url}".`);

        result = await $data.execSql({
            dialect: {
                mysql: _.template(TEST_MYSQL_IMG_REQ)({ id: testData.Id }),
                mssql: _.template(TEST_MSSQL_IMG_REQ)({ id: testData.Id })
            }
        }, {});
        if (result && result.detail && (result.detail.length > 0)) {
            result.detail.forEach((elem) => {
                testData.Images[elem.Type] = {
                    FileName: this._convertDataUrl(elem.FileName, isAbsPath, dLink),
                    MetaData: this._convertMeta(elem.MetaData, isAbsPath, dLink)
                };
            })
        }

        return testData;
    }

    async get(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let testObj = null;
        let testData = { Questions: [], Images: [] };

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
                    testData.Status = testObj.status();
                    testData.CourseId = testObj.courseId();
                    testData.LessonId = testObj.lessonId();
                    testData.Name = testObj.name();
                    testData.Method = testObj.method();
                    testData.MaxQ = testObj.maxQ();
                    testData.FromLesson = testObj.fromLesson();
                    testData.Duration = testObj.duration();
                    testData.IsTimeLimited = testObj.isTimeLimited();
                    testData.Cover = testObj.cover();
                    testData.CoverMeta = testObj.coverMeta();
                    testData.URL = testObj.uRL();
                    testData.SnPost = testObj.snPost();
                    testData.SnName = testObj.snName();
                    testData.SnDescription = testObj.snDescription();

                    let root_img = testObj.getDataRoot("TestMetaImage");
                    col = root_img.getCol("DataElements");
                    if (col.count()) {
                        for (let i = 0; i < col.count(); i++) {
                            let obj = col.get(i);
                            testData.Images.push({
                                Id: obj.id(),
                                Type: obj.type(),
                                FileName: obj.fileName(),
                                MetaData: obj.metaData(),
                            });
                        }
                    };

                    let root_q = testObj.getDataRoot("Question");
                    col = root_q.getCol("DataElements");
                    if (col.count()) {
                        testData.Questions = new Array(col.count());
                        for (let i = 0; i < col.count(); i++) {
                            let obj = col.get(i);
                            let q = {
                                Id: obj.id(),
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
                                        Id: obj_a.id(),
                                        Text: obj_a.text(),
                                        IsCorrect: obj_a.isCorrect()
                                    };
                                    q.Answers[obj_a.number() - 1] = a;
                                }
                            }
                        }
                    };
                    return testData;
                })
        }, memDbOptions);
    }

    async _getQuestionsByIds(ids, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let questions = {};

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjects(GET_QUISTIONS_REQ_TREE, { field: "Id", op: "in", value: ids }, dbOpts));
            })
                .then(async (root) => {
                    root_obj = root;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    let col = root_obj.getCol("DataElements");
                    for (let i = 0; i < col.count(); i++){
                        let obj = col.get(i);
                        let q = {
                            Id: obj.id(),
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
                        questions[q.Id] = q;
                        let root_a = obj.getDataRoot("Answer");
                        let col_a = root_a.getCol("DataElements");
                        if (col_a.count()) {
                            q.Answers = new Array(col_a.count());
                            for (let j = 0; j < col_a.count(); j++) {
                                let obj_a = col_a.get(j);
                                let a = {
                                    Id: obj_a.id(),
                                    Text: obj_a.text(),
                                    IsCorrect: obj_a.isCorrect()
                                };
                                q.Answers[obj_a.number() - 1] = a;
                            }
                        }
                    }
                    return questions;
                })
        }, memDbOptions);
    }

    async getTestInstance(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let testObj = null;
        let testData = { Questions: [] };

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, TEST_INST_REQ_TREE, dbOpts));
            })
                .then(async (root) => {
                    root_obj = root;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find test instance (Id = ${id}).`);

                    testObj = col.get(0);
                    testData.Id = testObj.id();
                    testData.UserId = testObj.userId();
                    testData.TestId = testObj.testId();
                    testData.StTime = testObj.stTime();
                    testData.ActDuration = testObj.actDuration();
                    testData.Duration = testObj.duration();
                    testData.Score = testObj.score();
                    testData.MaxScore = testObj.maxScore();
                    testData.IsFinished = testObj.isFinished();
                    testData.IsVisible = testObj.isVisible();

                    let root_iq = testObj.getDataRoot("InstanceQuestion");
                    let col_i = root_iq.getCol("DataElements");
                    let questions_list = {};
                    if (col_i.count()) {
                        testData.Questions = new Array(col_i.count());
                        for (let n = 0; n < col_i.count(); n++) {
                            let qobj = col_i.get(n);
                            let qi = {
                                Answer: qobj.answer(),
                                AnswTime: qobj.answTime(),
                                Score: qobj.score()
                            }
                            testData.Questions[qobj.number() - 1] = qi;
                            questions_list[qobj.questionId()] = qi;
                        }
                        let qids = Object.keys(questions_list).map(item => {
                            return parseInt(item);
                        });
                        let arr_q = splitArray(qids, MAX_QUESTIONS_REQ_LEN);
                        for (let i = 0; i < arr_q.length; i++){
                            let q = await this._getQuestionsByIds(arr_q[i], { dbOptions: dbOpts });
                            for (let id in q) {
                                let item = questions_list[id];
                                if (item)
                                    item.Question = q[id];
                            }
                        }
                    }
                    return testData;
                })
        }, memDbOptions);
    }

    async updateTestInstance(id, data, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};

        let root_obj = null;
        let testObj = null;
        let inpFields = data || {};

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, TEST_INST_REQ_TREE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find test instance (Id = ${id}).`);

                    testObj = col.get(0);
                    await root_obj.edit();

                    let fields = _.clone(inpFields);
                    delete fields.Questions;
                    this._setFieldValues(testObj, fields, { Id: true, UserId: true, Duration: true, MaxScore: true });

                    if (Array.isArray(inpFields.Questions)) {
                        let root_q = testObj.getDataRoot("InstanceQuestion");
                        let col_q = root_q.getCol("DataElements");
                        let q_list = {};
                        for (let i = 0; i < col_q.count(); i++) {
                            let obj = col_q.get(i);
                            q_list[obj.number()] = obj;
                        }
                        for (let i = 0; i < inpFields.Questions.length; i++) {
                            let fld = _.cloneDeep(inpFields.Questions[i]);
                            fld.Number = i + 1;
                            delete fld.Answers;
                            let list_obj = q_list[i + 1];
                            if (list_obj) {
                                this._setFieldValues(list_obj, fld, { Id: true, QuestionId: true, Number: true });
                                delete q_list[i + 1];
                            }
                        }
                    }

                    await root_obj.save(dbOpts);
                    return { result: "OK", id: id };
                })
        }, memDbOptions);
    }

    async createTestInstance(user_id, test_id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let params = opts.params || {};
        
        let root_obj = null;
        let testObj = null;

        let testData = await this.get(test_id, { dbOptions: dbOpts });
        let testInstanse = {
            Id: null,
            UserId: user_id,
            TestId: testData.Id,
            StTime: null,
            ActDuration: 0,
            Duration: 0,
            Score: 0,
            MaxScore: 0,
            IsFinished: false,
            IsVisible: true,
            Questions: []
        };
        for (let i = 0; i < testData.Questions.length; i++) {
            testInstanse.Questions.push({
                Answer: null,
                AnswTime: null,
                Score: null,
                Question: testData.Questions[i]
            });
        }

        if ((testData.Method === 2) && testData.FromLesson && testData.CourseId) {
            let result = await $data.execSql({
                dialect: {
                    mysql: _.template(GET_QUESTION_IDS_MYSQL)({ course_id: testData.CourseId }),
                    mssql: _.template(GET_QUESTION_IDS_MSSQL)({ course_id: testData.CourseId })
                }
            }, dbOpts);
            if (result && result.detail && (result.detail.length > 0)) {
                let qids = [];
                result.detail.forEach(elem => {
                    qids.push(elem.Id);
                })
                let arr_q = splitArray(qids, MAX_QUESTIONS_REQ_LEN);
                for (let i = 0; i < arr_q.length; i++) {
                    let q = await this._getQuestionsByIds(arr_q[i], { dbOptions: dbOpts });
                    for (let id in q) {
                        if (q[id].AllowedInCourse)
                            testInstanse.Questions.push({
                                Answer: null,
                                AnswTime: null,
                                Score: null,
                                Question: q[id]
                            });
                    }
                }
            }
        }

        let maxQ = params.MaxQ ? params.MaxQ : testData.MaxQ;
        if ((testData.Method === 2) && maxQ) {
            let newq = [];
            while ((newq.length < maxQ) && (testInstanse.Questions.length > 0)) {
                let idx = Math.floor(Math.random() * testInstanse.Questions.length);
                let elem = testInstanse.Questions.splice(idx, 1);
                newq.push(elem[0]);
            }
            testInstanse.Questions = newq;
        }

        for (let i = 0; i < testInstanse.Questions.length; i++)
            testInstanse.MaxScore += testInstanse.Questions[i].Score ? testInstanse.Questions[i].Score : 1;
        
        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(-1, TEST_INST_REQ_TREE, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let fields = _.clone(testInstanse);
                    delete fields.Questions;
                    delete fields.Id;

                    await root_obj.edit();
                    let newHandler = await root_obj.newObject({ fields: fields }, dbOpts);

                    testInstanse.Id = newHandler.keyValue;
                    testObj = this._db.getObj(newHandler.newObject);

                    if (testInstanse.Questions.length > 0) {
                        let root_q = testObj.getDataRoot("InstanceQuestion");
                        for (let i = 0; i < testInstanse.Questions.length; i++) {
                            let fld = _.cloneDeep(testInstanse.Questions[i]);
                            fld.Number = i + 1;
                            fld.QuestionId = fld.Question.Id;
                            delete fld.Question;
                            delete fld.Id;
                            await root_q.newObject({ fields: fld }, dbOpts);
                        }
                    }

                    await root_obj.save(dbOpts);
                    return { result: "OK", test: testInstanse };
                })
        }, memDbOptions);
    }

    async delTestInstance(id, options) {
        let memDbOptions = { dbRoots: [] };
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let root_obj = null;
        let testObj = null;

        return Utils.editDataWrapper(() => {
            return new MemDbPromise(this._db, resolve => {
                resolve(this._getObjById(id, {
                    expr: {
                        model: {
                            name: "TestInstance"
                        }
                    }
                }, dbOpts));
            })
                .then(async (result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    let col = root_obj.getCol("DataElements");
                    if (col.count() !== 1)
                        throw new HttpError(HttpCode.ERR_NOT_FOUND, `Can't find test instance (Id = ${id}).`);

                    testObj = col.get(0);
                    await root_obj.edit();
                    col._del(testObj);

                    await root_obj.save(dbOpts);
                    return { result: "OK", id: id };
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
                    if (testObj.uRL() && this._isNumericString(testObj.uRL()))
                        throw new Error(`Test URL can't be numeric: ${inpFields["URL"]}`);

                    if (Array.isArray(inpFields.Images)) {
                        let root_img = testObj.getDataRoot("TestMetaImage");
                        let img_collection = root_img.getCol("DataElements");
                        let img_list = {};

                        for (let i = 0; i < img_collection.count(); i++) {
                            let obj = img_collection.get(i);
                            img_list[obj.id()] = obj;
                        }

                        for (let i = 0; i < inpFields.Images.length; i++) {
                            let fld = _.cloneDeep(inpFields.Images[i]);
                            let img_obj = img_list[fld.Id];
                            if (img_obj) {
                                this._setFieldValues(img_obj, fld);
                                delete img_list[fld.Id];
                            }
                            else {
                                delete fld.Id;
                                await root_img.newObject({ fields: fld }, dbOpts);
                            }
                        }
                        for (let id in img_list)
                            img_collection._del(img_list[id]);
                    }

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
                    if (typeof (fields.Status) === "undefined")
                        fields.Status = 1; // "Черновик"
                    if (typeof (fields.URL) === "string") {
                        if (this._isNumericString(fields.URL))
                            throw new Error(`Test URL can't be numeric: ${fields.URL}`);
                    }

                    await root_obj.edit();
                    let newHandler = await root_obj.newObject({ fields: fields }, dbOpts);

                    newId = newHandler.keyValue;
                    testObj = this._db.getObj(newHandler.newObject);

                    if (Array.isArray(inpFields.Images) && (inpFields.Images.length > 0)) {
                        let root_img = testObj.getDataRoot("CourseMetaImage");
                        for (let i = 0; i < inpFields.Images.length; i++) {
                            let fld = _.cloneDeep(inpFields.Images[i]);
                            if (typeof (fld.MetaData) !== "undefined")
                                fld.MetaData = typeof (fld.MetaData === "string") ?
                                    fld.MetaData : JSON.stringify(fld.MetaData);
                            await root_img.newObject({
                                fields: fld
                            }, dbOpts);
                        }
                    }

                    if (Array.isArray(inpFields.Questions)) {
                        let root_q = testObj.getDataRoot("Question");
                        for (let i = 0; i < inpFields.Questions.length; i++) {
                            let fld = _.cloneDeep(inpFields.Questions[i]);
                            fld.Number = i + 1;
                            let answ = fld.Answers;
                            delete fld.Answers;
                            delete fld.Id;
                            if (typeof (fld.Score) === "undefined")
                                fld.Score = DFLT_QUESTION_SCORE;
                            if (typeof (fld.AnswTime) === "undefined")
                                fld.Score = DFLT_ANSW_TIME;
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
                resolve(this._getObjById(id, {
                    expr: {
                        model: {
                            name: "Test"
                        }
                    }
                }, dbOpts));
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
