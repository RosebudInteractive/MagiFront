'use strict';
const N_INSTANCES = 4;
const BASE_PORT = 3001;

let logPath = '/app/logs/node-v12/';
let srcBase = '/app/src/node-v12/MagisteriaTwo';

let app = {
    script: './server.js',
    cwd: `${srcBase}`,
    namespace: "site",
    instance_var: 'INSTANCE_ID',
    env: {
        NODE_ENV: 'production',
        NODE_CONFIG_ENV: 'new-magisteria-docker'
    }
};

// Magisteria instances
let apps = [];
for (let i = 0; i < N_INSTANCES; i++) {
    let port = BASE_PORT + i;
    let obj = Object.assign({}, app);
    obj.name = `Magisteria-${i + 1}`;
    obj.error_file = `${logPath}${obj.name}-error.log`;
    obj.out_file = `${logPath}${obj.name}-out.log`;
    obj.args = `-P ${port} -p ukko89QH`;
    apps.push(obj);
}

// Scheduled Tasks instance
let app_name = "Scheduled Tasks";
apps.push({
    name: app_name,
    script: './index.js',
    cwd: `${srcBase}/tasks`,
    namespace: "tasks",
    error_file: `${logPath}${app_name}-error.log`,
    out_file: `${logPath}${app_name}-out.log`,
    instance_var: 'INSTANCE_ID',
    env: {
        NODE_ENV: 'production',
        NODE_CONFIG_ENV: 'new-magisteria-tasks-docker'
    }
});

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: apps
};
