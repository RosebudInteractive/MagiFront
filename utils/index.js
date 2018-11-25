'use strict';

function getTimeStr(ts) {
    let now = ts ? new Date(ts) : new Date();
    let tZ_str = (now.getTimezoneOffset() < 0 ? "+" : "-") + Math.abs(now.getTimezoneOffset() / 60).toFixed(2) + "h";
    return `${now.toLocaleString()} ${tZ_str}`;
}

function buildLogString(message, ts) {
    return `[${getTimeStr(ts)}] ${message}`;
}

module.exports = {
    getTimeStr: getTimeStr,
    buildLogString: buildLogString
};