'use strict';
const request = require('request');
const got = require('got');
const randomstring = require('randomstring');
const { URL } = require('url');
const { buildLogString } = require('../utils');

const PROMO_CODE_LENGTH = 20;

async function _createPromo(url, data, token) {
    const { body } = await got.post(url, {
        headers: token ? { "Authorization": "JWT " + token } : undefined,
        json: data,
        responseType: 'json'
    });
    return body;
}

async function genPromoCodes(baseUrl, token, qty, prefix, description, code_length) {
    let result = [];
    let url = `${baseUrl}/api/adm/promo-codes`;
    for (let i = 0; i < qty; i++){
        let code = `${prefix}` +
            `${randomstring.generate({
                length: ((code_length ? code_length : PROMO_CODE_LENGTH) - prefix.length),
                charset: "alphanumeric",
                capitalization: "uppercase"
            })}`;
        let first_date = new Date();
        let promo_data = {
            Code: code,
            Perc: 100,
            Counter: 1,
            Description: description,
            FirstDate: first_date,
            IsVisible: false
        };
        await _createPromo(url, promo_data, token);
        result.push(code);
    }
    return result;
}

exports.PromoCodes = {
    genPromoCodes: genPromoCodes
};