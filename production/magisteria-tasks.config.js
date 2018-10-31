'use strict';

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [{
        name: 'Scheduled Tasks',
        script: './index.js',
        cwd: '/home/sites/magisteria.ru/MagisteriaTwo/tasks',
        instance_var: 'INSTANCE_ID',
        env: {
            NODE_ENV: 'production',
            NODE_CONFIG_ENV: 'magisteria-tasks'
        }
    }]
};
