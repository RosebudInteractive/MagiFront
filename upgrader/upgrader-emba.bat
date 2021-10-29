set NODE_ENV=development
set NODE_CONFIG_ENV=embadev-upgrader
node upgrader.js "-sqlTrace" "-v" "mssql" "-h" "dragonegg" "-t" "1433" "-d" "mag_admin" "-u" "sa" "-p" "Ub1206298"