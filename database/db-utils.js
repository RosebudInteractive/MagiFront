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

    fmtDuration: (duration, options) => {
        let hours = (duration / 3600) ^ 0;
        let minSecs = duration - hours * 3600;
        let secs = minSecs - ((minSecs / 60) ^ 0) * 60;
        let msecs = ((secs - (secs ^ 0)) * 1000) ^ 0;
        let opts = options || {};
        let hSep = opts.h ? opts.h : ":";
        let mSep = opts.m ? opts.m : ":";
        let sSep = opts.s ? opts.s : "";
        return (hours > 0 ? (hours.toString() + hSep) : "") + intFmtWithLeadingZeros((minSecs / 60) ^ 0, 2) +
            mSep + intFmtWithLeadingZeros((secs ^ 0), 2) + (opts.ms ? ("." + intFmtWithLeadingZeros(msecs, 3)) : "") + sSep;
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
