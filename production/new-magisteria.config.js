'use strict';
const N_INSTANCES = 4;
const BASE_PORT = 3001;

let app = {
    script: './server.js',
    cwd: '/var/www/sites/magisteria/MagisteriaTwo/',
    instance_var: 'INSTANCE_ID',
    env: {
        NODE_ENV: 'production',
        NODE_CONFIG_ENV: 'new-magisteria'
    }
};

let apps = [];
for (let i = 0; i < N_INSTANCES; i++) {
    let port = BASE_PORT + i;
    let obj = Object.assign({}, app);
    obj.name = `Magisteria-${i + 1}`;
    obj.args = `-P ${port} -p ukko89QH`;
    apps.push(obj);
}

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: apps

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    // ,
    // deploy : {
    //   production : {
    //     user : 'node',
    //     host : '212.83.163.1',
    //     ref  : 'origin/master',
    //     repo : 'git@github.com:repo.git',
    //     path : '/var/www/production',
    //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    //   },
    //   dev : {
    //     user : 'node',
    //     host : '212.83.163.1',
    //     ref  : 'origin/master',
    //     repo : 'git@github.com:repo.git',
    //     path : '/var/www/development',
    //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
    //     env  : {
    //       NODE_ENV: 'dev'
    //     }
    //   }
    // }
};
