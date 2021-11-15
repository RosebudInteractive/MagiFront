const path = require('path');

let options = {
    root: process.cwd(),
    uccelloDir: path.join(__dirname, '../../Uccello2'),
    dbProvider: 'mssql',
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    upgrader: {
        // upgraderFile: "./release-builds/db-upgrade.json"
    },
    connections: {
        redis: {
            host: "dragonegg",
            port: 6379,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
        mssql: {
            host: 'dragonegg',
            port: 1435,
            username: 'sa',
            database: 'mag_admin',
            connection_options: { requestTimeout: 0 },
            provider_options: {},
            pool: {
                max: 10,
                min: 0,
                idle: 60000
            }
        },
        mysql: {
            host: 'dragonegg',
            username: 'sa',
            database: 'mag_admin',
            connection_options: {},
            provider_options: {},
            pool: {
                max: 10,
                min: 0,
                idle: 60000
            }
        }
    }
};

module.exports = options;