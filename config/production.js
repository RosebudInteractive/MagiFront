const path = require('path');

module.exports = {
    httpPort: 8090,
    dbProvider: 'mysql',
    trace: {
        sqlTrace: false,
        importFileTrace: false
    },
    authentication: {
        enabled: false,
        secret: 'tasmanianDevil',
        storage: 'redis'// Also can be 'local' (not applicable for cluster mode)
    },
    connections: {
        redis: {
            host: "localhost",
            port: 6379,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
        mysql: {
            host: 'localhost',
            username: 'magadmin',
            password: 'magadmin12345',
            database: 'mag_admin',
            connection_options: {},
            provider_options: {},
            pool: {
                max: 5,
                min: 0,
                idle: 60000
            }
        }
    }
};
