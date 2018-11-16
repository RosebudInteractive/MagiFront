'use strict';
const N_INSTANCES = 4;
const BASE_PORT = 3001;

let app = {
    script: './server.js',
    cwd: '/home/sites/magisteria.ru/MagisteriaTwo',
    instance_var: 'INSTANCE_ID',
    env: {
        NODE_ENV: 'production',
        NODE_CONFIG_ENV: 'magisteria-main'
    }
};

let apps = [];
for (let i = 0; i < N_INSTANCES; i++) {
    let port = BASE_PORT + i;
    let obj = Object.assign({}, app);
    obj.name = `Magisteria-${i + 1}`;
    obj.args = `-P ${port}`;
    apps.push(obj);
}

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: apps
};
