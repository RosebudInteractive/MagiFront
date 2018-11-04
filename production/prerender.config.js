'use strict';

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [{
        name: 'Prerender Server',
        script: './server.js',
        cwd: '/var/www/sites/magisteria/prerender',
        instances: 2,
        exec_mode: "cluster",
        instance_var: 'INSTANCE_ID',
        env: {
            NODE_ENV: 'production',
            PORT: 8000
        }
    }]

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
