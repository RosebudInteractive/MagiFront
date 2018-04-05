var mysql_connection = { //MySql
    host: process.env.MY_HOST || "localhost",
    username: process.env.MY_USER || "root",
    password: process.env.MY_PASSWORD || "masterkey",
    database: process.env.MY_DB || "magistery_admin",
    provider: "mysql",
    connection_options: {},
    provider_options: {},
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};
var http_config = {
    port: 3000
};
var config = {
    connection: mysql_connection,
    http: http_config
}

exports.magisteryConfig = config;