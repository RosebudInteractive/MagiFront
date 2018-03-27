/**
 * Created by levan.kiknadze on 12/11/2017.
 */

exports.DatabaseBuilder = class {

    get config() {
        return this._config;
    }

    constructor(config) {
        this._config = config;
    }

    initDatabase() {
        console.log("Init db started");
        var that = this;
        return new Promise((resolve, reject) => {
            var fs = require('fs');
            var filename = __dirname + "/scripts/create.sql";
            fs.readFile(filename, 'utf8', function(err, data) {
                if (err) {
                    reject(err);
                    return;
                }

                const mySQL = require('mysql');
                const connection = mySQL.createConnection({
                    host: that._config.connection.host,
                    user: that._config.connection.username,
                    password: that._config.connection.password,
                    database: that._config.connection.database,
                    multipleStatements: true
                });

                connection.connect(function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    connection.query(data, (err) => {
                        connection.end();
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    })
                });
            });
        });
    }
}