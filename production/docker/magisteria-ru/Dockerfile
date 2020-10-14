# PM2 & Node JS v.12
FROM keymetrics/pm2:12-alpine

#Time service
RUN apk update
RUN apk add --update tzdata

# PM2 logrotate
RUN pm2 install pm2-logrotate

# It's supposed to be mapped to "/var/www/sites/magisteria"
WORKDIR /app

# Magisteria ports
EXPOSE 3001-3004

CMD [ "./src/node-v12/MagisteriaTwo/production/docker/magisteria-ru/docker-start.sh" ]