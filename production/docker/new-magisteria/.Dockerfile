# Node JS v.12
FROM keymetrics/pm2:12-alpine

# Create directories
mkdir app
cd ./app
mkdir feed
mkdir keys
mkdir logs
mkdir MagisteriaTwo
mkdir pricelist
mkdir sitemaps
mkdir Uccello2
mkdir uploads

# Install app dependencies
RUN cd ./MagisteriaTwo
RUN npm install
RUN cd ../Uccello2
RUN npm install

CMD [ "pm2-runtime", "--error", "./logs", "--output", "./logs", "start", "./MagisteriaTwo/production/new-magisteria-docker.config.js" ]