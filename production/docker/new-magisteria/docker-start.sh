BuildVar = "${BUILD:-'SKIP'}"
ModeVar = "${MODE:-'PM2'}"
cd app/src/node-v12/MagisteriaTwo
if [ BuildVar == 'ALL' ] || [ BuildVar == 'MAG' ]
then
  npm install
cd app/src/node-v12/Uccello2
if [ BuildVar == 'ALL' ] || [ BuildVar == 'LIB' ]
then
  npm install
cd app/src/node-v12

if [ ModeVar == 'PM2' ]
then
  pm2-runtime start ./MagisteriaTwo/production/new-magisteria-docker.config.js --error "/app/logs/" --output "/app/logs/"