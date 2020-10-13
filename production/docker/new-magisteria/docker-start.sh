BuildVar=${BUILD:-SKIP}
ModeVar=${MODE:-NONE}

echo "BuildVar: "$BuildVar
echo "ModeVar: "$ModeVar

cd /app/src/node-v12/MagisteriaTwo

case $BuildVar in
ALL|MAG|MAG_CLIENT)
npm install;;
esac

case $BuildVar in
ALL|CLIENT|MAG_CLIENT)
npm run build;;
esac

cd /app/src/node-v12/Uccello2
case $BuildVar in
ALL|LIB)
npm install;;
esac

case $ModeVar in
START)
cd /app/src/node-v12;;
UPGRADE)
cd /app/src/node-v12/MagisteriaTwo/upgrader;;
esac

case $ModeVar in
START)
pm2-runtime start ./MagisteriaTwo/production/new-magisteria-docker.config.js --error "/app/logs/" --output "/app/logs/";;
UPGRADE)
node upgrader -sqlTrace -v mysql -h 10.1.0.35 -d magisteria -u magisteria -p ${PASSWD};;
esac
