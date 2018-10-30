'use strict';

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [{
        name: 'Prerender Server',
        script: './server.js',
        cwd: '/home/sites/magisteria.ru/prerender',
        instance_var: 'INSTANCE_ID',
        env: {
            NODE_ENV: 'production',
            PORT: 8000
        }
    }]
};
