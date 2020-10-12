cd ./MagisteriaTwo
npm install
cd ../Uccello2
npm install
cd ..

pm2-runtime --error ./logs --output ./logs start ./MagisteriaTwo/production/new-magisteria-docker.config.js