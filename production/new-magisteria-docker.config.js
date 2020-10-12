'use strict';
const N_INSTANCES = 4;
const BASE_PORT = 3001;

let app = {
    script: './MagisteriaTwo/server.js',
    cwd: './MagisteriaTwo/',
    instance_var: 'INSTANCE_ID',
    env: {
        NODE_ENV: 'production',
        NODE_CONFIG_ENV: 'new-magisteria'
    }
};

// Magisteria instances
let apps = [];
for (let i = 0; i < N_INSTANCES; i++) {
    let port = BASE_PORT + i;
    let obj = Object.assign({}, app);
    obj.name = `Magisteria-${i + 1}`;
    obj.args = `-P ${port} -p ukko89QH`;
    apps.push(obj);
}

// Scheduled Tasks instance
apps.push({
    name: 'Scheduled Tasks',
    script: './MagisteriaTwo/tasks/index.js',
    cwd: './MagisteriaTwo/tasks',
    instance_var: 'INSTANCE_ID',
    env: {
        NODE_ENV: 'production',
        NODE_CONFIG_ENV: 'new-magisteria-tasks'
    }
});

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: apps
};
