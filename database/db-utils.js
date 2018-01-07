const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

exports.DbUtils = {
    execSqlScript: (mysql_script, mssql_script, opts) => {
        return new Promise((resolve, reject) => {
            if (mysql_script.length !== mssql_script.length)
                throw new Error("MySql and MSSQL scripts have different lengths.");
            resolve(
                Utils.seqExec(mysql_script.length, (idx) => {
                    return $data.execSql({
                        dialect: {
                            mysql: mysql_script[idx],
                            mssql: mssql_script[idx]
                        }
                    }, opts);
                })
            );
        })
    }
};
