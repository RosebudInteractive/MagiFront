BuildVar=${BUILD:-SKIP}
ModeVar=${MODE:-PM2}

echo "BuildVar: "$BuildVar
echo "ModeVar: "$ModeVar

cd /app/src/node-v12/MagisteriaTwo

case $BuildVar in
ALL|MAG)
npm install;;
esac

cd /app/src/node-v12/Uccello2
case $BuildVar in
ALL|LIB)
npm install;;
esac

case $ModeVar in
PM2)
cd /app/src/node-v12;;
UPGRADE)
cd /app/src/node-v12/MagisteriaTwo/upgrader;;
esac

case $ModeVar in
PM2)
pm2-runtime start ./MagisteriaTwo/production/new-magisteria-docker.config.js --error "/app/logs/" --output "/app/logs/";;
UPGRADE)
node upgrader -sqlTrace -v mysql -h 10.1.0.35 -d magisteria -u magisteria -p $PWD;;
esac
