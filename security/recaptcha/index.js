'use strict'
const config = require('config');
const reCAPTCHA = require('recaptcha2');

exports.recaptcha = new reCAPTCHA({
    siteKey: config.authentication.reCapture.siteKey,
    secretKey: config.authentication.reCapture.secretKey
});