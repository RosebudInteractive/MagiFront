BuildVar=${BUILD:-SKIP}
RunVar=${RUN:-NONE}
HostIp=10.1.0.35

echo "BUILD: "$BuildVar
echo "RUN: "$RunVar
echo "HostIp: "$HostIp

echo "=================================================================="
echo "  OPTIONS:"
echo "    BUILD ="
echo "       SKIP    - (default) do nothing"
echo "       ALL     - bild all"
echo "       SRV     - bild server only"
echo "       CLI     - bild client only"
echo "       SRV_CLI - bild server && client only"
echo "       LIB     - bild Uccello library only"
echo "    RUN ="
echo "       NONE    - (default) do nothing"
echo "       START   - start service"
echo "       UPGRADE - run DB upgrader"
echo "=================================================================="


cd /app/src/node-v12/MagisteriaTwo

case $BuildVar in
ALL|SRV|SRV_CLI)
npm install;;
esac

case $BuildVar in
ALL|CLI|SRV_CLI)
npm run build;;
esac

cd /app/src/node-v12/Uccello2
case $BuildVar in
ALL|LIB)
npm install;;
esac

case $RunVar in
START)
cd /app/src/node-v12;;
UPGRADE)
cd /app/src/node-v12/MagisteriaTwo/upgrader;;
esac

case $RunVar in
START)
pm2-runtime start ./MagisteriaTwo/production/new-magisteria-docker.config.js;;
UPGRADE)
node upgrader -sqlTrace -v mysql -h $HostIp -d magisteria -u magisteria -p ${PASSWD};;
esac
