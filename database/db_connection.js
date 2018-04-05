/**
 * Created by levan.kiknadze on 13/11/2017.
 */
var mysql=require('mysql');
var pool = null;

exports.DatabasePool = class DatabasePool {
    constructor(config) {
        if (!pool) {
            pool = mysql.createPool({
                host: config.connection.host,
                user: config.connection.username,
                password: config.connection.password,
                database: config.connection.database,
                multipleStatements: true
            });
        }
    }

    getConnection() {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(connection);
            });
        })
    }
}