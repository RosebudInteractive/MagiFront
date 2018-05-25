'use strict';
const N_INSTANCES = 8;
const BASE_PORT = 3000;

let app = {
  script: './server.js',
  cwd: '/home/sashasokolov/Projects/Genetix/Factory/MagisteriaTwo/',
  instance_var: 'INSTANCE_ID',
  env: {
    NODE_ENV: 'production',
    NODE_CONFIG_ENV: 'dragonegg',
    EMBA_TEST_HOST: "dragonegg"
  }
};

let apps = [];
for (let i = 0; i < N_INSTANCES; i++){
  let port = BASE_PORT + i;
  let obj = Object.assign({}, app);
  obj.name = `Magisteria-${i + 1}`;
  obj.args = `-P ${port} -p system`;
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
