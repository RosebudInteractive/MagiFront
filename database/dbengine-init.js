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
                    sqlCommands: false,
                    importDir: false
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

        if (false) {
            const { AuthorsService } = require("./db-author");
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
    }
}