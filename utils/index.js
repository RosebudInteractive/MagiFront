'use strict';

function getTimeStr(ts) {
    let now = ts ? new Date(ts) : new Date();
    let tZ_str = (now.getTimezoneOffset() < 0 ? "+" : "-") + Math.abs(now.getTimezoneOffset() / 60).toFixed(2) + "h";
    return `${now.toLocaleString()} ${tZ_str}`;
}

function buildLogString(message, ts) {
    return `[${getTimeStr(ts)}] ${message}`;
}

//
// https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
//
function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

function splitArray(in_array, max_size) {
    let restIds = in_array.length;
    let currPos = 0;
    let arrayOfIds = [];
    while (restIds > 0) {
        let len = restIds > max_size ? max_size : restIds;
        arrayOfIds.push(in_array.slice(currPos, currPos + len));
        restIds -= len;
        currPos += len;
    }
    return arrayOfIds;
}

module.exports = {
    getTimeStr: getTimeStr,
    buildLogString: buildLogString,
    roundNumber: roundNumber,
    splitArray: splitArray
};