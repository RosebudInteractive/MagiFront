cd ./src/node-v12/MagisteriaTwo
npm install
cd ../Uccello2
npm install
cd ..

pm2-runtime --error /app/logs --output /app/logs start ./MagisteriaTwo/production/new-magisteria-docker.config.js