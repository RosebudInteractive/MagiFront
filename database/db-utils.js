const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');

function intFmtWithLeadingZeros(val, width) {
    let res = val.toString();
    let rest = width - res.length;
    if (rest > 0)
        for (let i = 0; i < rest; i++)
            res = "0" + res;
    return res;
}

exports.DbUtils = {
    intFmtWithLeadingZeros: intFmtWithLeadingZeros,

    fmtDuration: (duration) => {
        let hours = (duration / 3600) ^ 0;
        let minSecs = duration - hours * 3600;
        return (hours > 0 ? (hours.toString() + ":") : "") + intFmtWithLeadingZeros((minSecs / 60) ^ 0, 2) +
            ":" + intFmtWithLeadingZeros(minSecs - ((minSecs / 60) ^ 0) * 60, 2);
    },

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
