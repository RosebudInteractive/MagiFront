# PM2 & Node JS v.12
FROM keymetrics/pm2:12-alpine

# It's supposed to be mapped to "/var/www/sites/magisteria"
WORKDIR /app

# Magisteria ports
EXPOSE 3001-3004

CMD [ "./src/node-v12/MagisteriaTwo/production/docker/new-magisteria/docker-start.sh" ]