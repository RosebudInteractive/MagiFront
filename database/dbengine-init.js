const uccelloDir = '../../Uccello2';


exports.DbEngineInit = class DbEngineInit {
    constructor(options) {

        var debugFlag = false;
        var autoImportFlag = false;

        var provider = null;
        var is_provider_next = false;

        var host = null;
        var is_host_next = false;

        var port = null;
        var is_port_next = false;

        var instance = null;
        var is_instance_next = false;

        var user = null;
        var is_user_next = false;

        var pwd = null;
        var is_pwd_next = false;

        var dbname = null;
        var is_dbname_next = false;

        var sqlTrace = false;
        var importFileTrace = false;

        for (var _cnt = 0; _cnt < process.argv.length; _cnt++) {
            var _arg = process.argv[_cnt];

            if (is_provider_next) {
                is_provider_next = false;
                provider = _arg;
                continue;
            }

            if (is_host_next) {
                is_host_next = false;
                host = _arg;
                continue;
            }

            if (is_port_next) {
                is_port_next = false;
                port = _arg;
                continue;
            }

            if (is_instance_next) {
                is_instance_next = false;
                instance = _arg;
                continue;
            }

            if (is_user_next) {
                is_user_next = false;
                user = _arg;
                continue;
            }

            if (is_pwd_next) {
                is_pwd_next = false;
                pwd = _arg;
                continue;
            }

            if (is_dbname_next) {
                is_dbname_next = false;
                dbname = _arg;
                continue;
            }

            switch (_arg) {

                case "-v":
                    is_provider_next = true;
                    break;

                case "-h":
                    is_host_next = true;
                    break;

                case "-t":
                    is_port_next = true;
                    break;

                case "-i":
                    is_instance_next = true;
                    break;

                case "-u":
                    is_user_next = true;
                    break;

                case "-p":
                    is_pwd_next = true;
                    break;

                case "-d":
                    is_dbname_next = true;
                    break;

                case "-debug":
                    debugFlag = true;
                    break;

                case "-autoimport":
                    autoImportFlag = true;
                    break;

                case "-sqlTrace":
                    sqlTrace = true;
                    break;

                case "-importFileTrace":
                    importFileTrace = true;
                    break;
            }
        };

        var mssql_connection = { //MSSQL
            host: process.env.MS_HOST || host || "10.1.1.3", // "SQL-SERVER"
            port: process.env.MS_PORT || port || 1435,       // instanceName: "SQL2008R2"
            username: process.env.MS_USER || user || "sa",
            password: process.env.MS_PASSWORD || pwd || "system",
            database: process.env.MS_DB || dbname || "genetix_test",
            provider: "mssql",
            connection_options: { requestTimeout: 0 },
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 60000
            }
        };
        var instance_name = process.env.MS_INST || instance;
        if (instance_name)
            mssql_connection.connection_options.instanceName = instance_name;

        var mysql_connection = { //MySql
            host: process.env.MY_HOST || host || "localhost",
            username: process.env.MY_USER || user || "root",
            password: process.env.MY_PASSWORD || pwd || "masterkey",
            database: process.env.MY_DB || dbname || "magistery_admin",
            provider: "mysql",
            connection_options: {},
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 60000
            }
        };

        var USE_MSSQL_SERVER = (process.env.DB_TYPE === 'ms_sql') || (provider === "mssql");

        const UccelloConfig = require(uccelloDir + '/config/config');
        global.UCCELLO_CONFIG = new UccelloConfig({
            dataPath: __dirname + '/data/',
            uccelloPath: __dirname + '/' + uccelloDir + '/',
            dataman: {
                connection: USE_MSSQL_SERVER ? mssql_connection : mysql_connection,

                importData: {
                    autoimport: autoImportFlag,
                    dir: __dirname + "/data/tables",
                    metaDir: __dirname + "/data/meta",
                    dataModelsDir: __dirname + "/data/data-models"
                },
                trace: {
                    sqlCommands: sqlTrace,
                    importDir: importFileTrace
                }
            },
            resman: {
                useDb: true,
                defaultProduct: "ProtoOne",
                sourceDir: [
                    { path: __dirname + "/data/meta/", type: "META" },
                    { path: __dirname + "/data/data-models/", type: "DMODEL" }
                ]
            },
            resourceBuilder: {
                types: [
                    { Code: "META", Name: "Meta Model", ClassName: "MetaModel", Description: "Мета-информация" },
                    { Code: "DMODEL", Name: "Data Model", ClassName: "DataModel", Description: "Data-модель" }
                ],
                destDir: __dirname + "/data/tables/",
                formResTypeId: 1,
                productId: 2,
                currBuildId: 2
            }
        });

        const Router = require(uccelloDir + '/connection/router');
        const Rpc = require(uccelloDir + '/system/rpc');
        const ConstructHolder = require(uccelloDir + '/system/construct-holder');
        const MemDbConnector = require(uccelloDir + '/memdatabase/memdbconnect');
        const MemDbController = require(uccelloDir + '/memdatabase/memdbcontroller');
        const DataObjectEngine = require(uccelloDir + '/dataman/data-object-engine');
        const Resman = require(uccelloDir + '/resman/resman');
        const Dataman = require(uccelloDir + '/dataman/dataman');
        const CompmanExt = require(uccelloDir + '/components/compmanext');

        if (typeof ($debug) === "undefined")
            global.$debug = {};

        global.$isServerSide = true;
        global.$constructors = new ConstructHolder();
        $constructors.loadControls();
        global.DEBUG = false;

        const router = new Router();
        const rpc = new Rpc({ router: router });
        const memDbConnector = new MemDbConnector({ router: router });
        const memDbController = new MemDbController(memDbConnector, {});
    
        const { getSchemaGenFunc } = require('./mag-models');
        UCCELLO_CONFIG.dataman.schemaGen = getSchemaGenFunc(uccelloDir);
        UCCELLO_CONFIG.dataman.createTypeData = true;
        new Dataman(router, rpc, memDbController, $constructors);
        global.$memDataBase = new CompmanExt(memDbController, null, { isLocal: true });

        // "AuthorsService" tests
        if (false) {
            let { AuthorsService } = require("./db-author");
            let au = AuthorsService();
            let upd_id;
            au.insert({ FirstName: "Alex", LastName: "Pushkin", Portrait: "asdasd.jpg" })
                .then(() => {
                    return au.insert({ FirstName: "Mike", LastName: "Lermontov" });
                })
                .then((result) => {
                    upd_id = result.id;
                    return au.get(result.id);
                })
                .then((result) => {
                    console.log("get: " + JSON.stringify(result));
                })
                .then(() => {
                    return au.update(upd_id, { FirstName: "=Mike=", LastName: "=Lermontov=", Portrait: "m_lermontov.jpg" });
                })
                .then((result) => {
                    return au.get(upd_id);
                })
                .then((result) => {
                    console.log("get after update: " + JSON.stringify(result));
                })
                .then(() => {
                    return au.getAll();
                })
                .then((result) => {
                    console.log("getAll: " + JSON.stringify(result));
                })
                .then(() => {
                    return au.insert({ FirstName: "Lev", LastName: "Tolstoy" });
                })
                .then((result) => {
                    let id = result.id;
                    return au.del(id);
                })
                .then((result) => {
                    console.log("Deleted: " + JSON.stringify(result));
                })
                .catch((err) => {
                    console.error("ERROR: " + err.message);
                });
        };

        // "CategoriesService" tests
        if (false) {
            let { CategoriesService } = require("./db-category");
            let ctg = CategoriesService();
            let upd_id;
            ctg.insert({ Name: "Религия" })
                .then((result) => {
                    return ctg.insert({ Name: "Ислам", ParentId: result.id });
                })
                .then((result) => {
                    upd_id = result.id;
                    return ctg.get(result.id);
                })
                .then((result) => {
                    console.log("get: " + JSON.stringify(result));
                })
                .then(() => {
                    return ctg.update(upd_id, { Name: "Православие" });
                })
                .then((result) => {
                    return ctg.get(upd_id);
                })
                .then((result) => {
                    console.log("get after update: " + JSON.stringify(result));
                })
                .then(() => {
                    return ctg.getAll();
                })
                .then((result) => {
                    console.log("getAll: " + JSON.stringify(result));
                })
                .then(() => {
                    return ctg.insert({ Name: "Category Test" });
                })
                .then((result) => {
                    let id = result.id;
                    return ctg.del(id);
                })
                .then((result) => {
                    console.log("Deleted: " + JSON.stringify(result));
                })
                .catch((err) => {
                    console.error("ERROR: " + err.message);
                });
        };

        // "LanguagesService" tests
        if (false) {
            let { LanguagesService } = require("./db-language");
            let lng = LanguagesService();
            let upd_id;
            lng.insert({ Code: "LT", Language: "Lietuvių" })
                .then((result) => {
                    return lng.insert({ Code: "LL", Language: "Latviešu" });
                })
                .then((result) => {
                    upd_id = result.id;
                    return lng.get(result.id);
                })
                .then((result) => {
                    console.log("get: " + JSON.stringify(result));
                })
                .then(() => {
                    return lng.update(upd_id, { Code: "LV" });
                })
                .then((result) => {
                    return lng.get(upd_id);
                })
                .then((result) => {
                    console.log("get after update: " + JSON.stringify(result));
                })
                .then(() => {
                    return lng.getAll();
                })
                .then((result) => {
                    console.log("getAll: " + JSON.stringify(result));
                })
                .then(() => {
                    return lng.insert({ Code: "ES", Language: "Eesti" });
                })
                .then((result) => {
                    let id = result.id;
                    return lng.del(id);
                })
                .then((result) => {
                    console.log("Deleted: " + JSON.stringify(result));
                })
                .catch((err) => {
                    console.error("ERROR: " + err.message);
                });
        };

        // "CoursesService" tests
        if (false) {
            let { CoursesService } = require("./db-course");
            let crs = CoursesService();
            let upd_id = 1;
            crs.getAll()
                .then((result) => {
                    console.log("getAll: " + JSON.stringify(result));
                })
                .then(() => {
                    return crs.get(upd_id);
                })
                .then((result) => {
                    console.log("get: " + JSON.stringify(result));
                })
                .then(() => {
                    return crs.getAuthors(upd_id);
                })
                .then((result) => {
                    console.log("getAuthors: " + JSON.stringify(result));
                })
                .then(() => {
                    return crs.insert({
                        "Color": 13413051,
                        "Cover": "https://magisteria.ru/wp-content/uploads/2016/08/new-1.jpg",
                        "State": "D",
                        "LanguageId": 1,
                        "URL": "https://magisteria.ru/courseNew",
                        "Name": "Новый курс",
                        "Description": "Обзорный курс по обзорному курсу.",
                        "Authors": [3, 1],
                        "Categories": [3, 10],
                        "Lessons": [
                            { "LessonId": 3, "ReadyDate": "2017-12-30", "State": "D" },
                            { "LessonId": 2, "ReadyDate": "2018-01-30", "State": "D" },
                            { "LessonId": 1, "ReadyDate": "2018-03-30", "State": "D" }
                        ]
                    });
                })
                .then((result) => {
                    upd_id = result.id;
                    return crs.get(result.id);
                })
                .then((result) => {
                    console.log("get: " + JSON.stringify(result));
                })
                .then(() => {
                    return crs.update(1, {
                        "Authors": [1],
                        "Categories": [10, 8],
                        "Lessons": [
                            { "LessonId": 2, "ReadyDate": "2018-01-30", "State": "D" },
                            { "LessonId": 3, "ReadyDate": "2017-12-30", "State": "D" }
                        ]
                    });
                })
                .then((result) => {
                    return crs.get(1);
                })
                .then((result) => {
                    console.log("get after update 1: " + JSON.stringify(result));
                })
                .then(() => {
                    return crs.update(upd_id, {
                        "Color": 333,
                        "Name": "Новый курс XXXXX",
                        "Description": "====Обзорный курс по обзорному курсу.",
                        "Authors": [2],
                        "Categories": [10, 1],
                        "Lessons": [
                            { "LessonId": 2, "ReadyDate": "2018-01-30", "State": "D" },
                            { "LessonId": 3, "ReadyDate": "2017-12-30", "State": "D" }
                        ]
                    });
                })
                .then((result) => {
                    return crs.get(upd_id);
                })
                .then((result) => {
                    console.log("get after update: " + JSON.stringify(result));
                })
                .then(() => {
                    return crs.del(upd_id);
                })
                .then((result) => {
                    console.log("Deleted: " + JSON.stringify(result));
                })
                .catch((err) => {
                    console.error("ERROR: " + err.message);
                });
        };

        // "LessonsService" tests
       if (false) {
            let { LessonsService } = require("./db-lesson");
            let { CoursesService } = require("./db-course");
            let crs = CoursesService();
            let ls = LessonsService();

            let upd_id = 1;
            let course_id = 1;
            let new_course_id;
            let new_lesson_id;

            ls.get(upd_id, course_id)
                .then((result) => {
                    console.log("Lesson 1 in Course 1 [get]: " + JSON.stringify(result));
                })
                .then(() => {
                    return crs.insert({
                        "Color": 13413051,
                        "Cover": "https://magisteria.ru/wp-content/uploads/2016/08/new-1.jpg",
                        "State": "D",
                        "LanguageId": 1,
                        "URL": "https://magisteria.ru/courseNew",
                        "Name": "Новый курс",
                        "Description": "Обзорный курс по обзорному курсу.",
                        "Authors": [3, 1],
                        "Categories": [3, 10],
                        "Lessons": [
                            { "LessonId": 3, "ReadyDate": "2017-12-30", "State": "D" },
                            { "LessonId": 2, "ReadyDate": "2018-01-30", "State": "D" },
                            { "LessonId": 1, "ReadyDate": "2018-03-30", "State": "D" }
                        ]
                    });
                })
                .then((result) => {
                    new_course_id = result.id;
                    return crs.get(result.id);
                })
                .then((result) => {
                    console.log("NEW COURSE get: " + JSON.stringify(result));
                })
                .then((result) => {
                    return ls.get(upd_id, new_course_id);
                })
                .then((result) => {
                    console.log("Lesson 1 in NEW COURSE [get]: " + JSON.stringify(result));
                })
                .then(() => {
                    return ls.insert({
                        AuthorId: 3,
                        LessonType: "L",
                        URL: null,
                        State: "D",
                        ReadyDate: "2017-12-10",
                        Name: "New Lesson of New Course",
                        ShortDescription: "New Lesson of New Course ShortDescription",
                        Episodes: [
                            { Id: 1, Number: 1, Supp: false },
                            { Id: 2, Number: 1, Supp: true }
                        ],
                        References: [
                            { Number: 1, Description: "Book 1", Recommended: false },
                            { Number: 1, Description: "Recommended Book 1", Recommended: true }
                        ]
                    }, new_course_id)
                        .then((result) => {
                            new_lesson_id = result.id;
                            return ls.get(result.id, new_course_id);
                        });
                })
                .then((result) => {
                    console.log("NEW LESSON in NEW COURSE [get]: " + JSON.stringify(result));
                })
                .then(() => {
                    return ls.update(new_lesson_id, new_course_id, {
                        AuthorId: 1,
                        LessonType: "L",
                        URL: "http://rbc.ru",
                        State: "R",
                        ReadyDate: "2018-12-10",
                        FullDescription: "New Lesson of New Course FullDescription",
                        Episodes: [
                            { Id: 3, Number: 1, Supp: false },
                            { Id: 1, Number: 1, Supp: true },
                            { Id: 4, Number: 2, Supp: true },
                            { Id: 2, Number: 2, Supp: false }
                        ],
                        References: [
                            { Id: 6, Number: 1, Description: "Book 11", Recommended: false },
                            { Number: 1, Description: "Another Recommended Book 1", Recommended: true }
                        ]
                    })
                        .then(() => {
                            return ls.get(new_lesson_id, new_course_id);
                        });
                })
                .then((result) => {
                    console.log("Update NEW LESSON in NEW COURSE [get]: " + JSON.stringify(result));
                })
                .then(() => {
                    return ls.update(upd_id, course_id, {
                        AuthorId: 1,
                        LessonType: "L",
                        URL: "http://rbc.ru",
                        State: "R",
                        ReadyDate: "2018-12-10",
                        FullDescription: "New Lesson of New Course FullDescription",
                        Episodes: [
                            { Id: 3, Number: 1, Supp: false },
                            { Id: 1, Number: 1, Supp: true },
                            { Id: 4, Number: 2, Supp: true },
                            { Id: 2, Number: 2, Supp: false }
                        ]
                    })
                        .then(() => {
                            return ls.get(upd_id, course_id);
                        });
                })
                .then((result) => {
                    console.log("Update 1st LESSON in the 1st COURSE [get]: " + JSON.stringify(result));
                })
                .then((result) => {
                    // Delete Lesson 1 from NEW COURSE
                    return ls.del(upd_id, new_course_id)
                        .then(() => {
                            return ls.get(upd_id, new_course_id);
                        });
                })
                .then((result) => {
                    console.log("Lesson 1 in NEW COURSE [get]: " + JSON.stringify(result));
                })
                .then((result) => {
                    // Delete Lesson 1 from Course 1
                    return ls.del(upd_id, course_id)
                        .then(() => {
                            return ls.get(upd_id, course_id);
                        });
                })
                .then((result) => {
                    console.log("Lesson 1 in Course 1 [get]: " + JSON.stringify(result));
                })
                .catch((err) => {
                    console.error("ERROR: " + err.message);
                });
        }
    }
}