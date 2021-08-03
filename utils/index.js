'use strict';
const _ = require('lodash');
const truncate = require('truncate-html');
const config = require('config');

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

const TRANCATE_HTML_DFLTS = { length: 30, inPerc: true, reserveLastWord: 25 }; // keep 30% of initial html
const _truncate_html_dflts = config.has("general.paid_truncate") ?
    _.defaultsDeep(config.general.paid_truncate, TRANCATE_HTML_DFLTS) : TRANCATE_HTML_DFLTS;
    
const ts_pattern = "...</u></b>";
const st_ts_pattern = "<b><u>";
const ts_pattern_length = ts_pattern.length;
const replace_pattern = "...";
const ts_max_len = 40;
const ts_distance = 10;

function truncateHtml(str, length, options) {
    let opts = _.defaultsDeep(options, _truncate_html_dflts);
    let len = length;
    if (opts.inPerc) {
        opts.byWords = false;
        delete opts.inPerc;
        len = Math.round(str.length * (length ? length : opts.length) / 100);
        delete opts.length;
    }
    let res = truncate(str, len, opts);
    // Removing partially truncated timestamps from transcript
    let pos1 = res.lastIndexOf(ts_pattern);
    if ((pos1 > 0) && ((res.length - pos1 - ts_pattern_length) < ts_distance)) {
        let pos2 = res.lastIndexOf(st_ts_pattern);
        if ((pos1 > pos2) && ((pos1 - pos2) < ts_max_len))
            res = res.substring(0, pos2) + replace_pattern + res.substring(pos1 + ts_pattern_length);
    }
    return res
}

function validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function isStringEmpty(str) {
    let res = true;
    if (str) {
        let _str = '' + str;
        res = _str.length === 0;
    }
    return res;
}

module.exports = {
    getTimeStr: getTimeStr,
    buildLogString: buildLogString,
    roundNumber: roundNumber,
    splitArray: splitArray,
    truncateHtml: truncateHtml,
    validateEmail: validateEmail,
    isStringEmpty: isStringEmpty
};