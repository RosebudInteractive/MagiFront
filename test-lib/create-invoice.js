'use strict';
const request = require('request');
const fs = require('fs');
const { URL } = require('url');
const { login } = require('./utils');
const { HttpMessage, HttpCode } = require('../const/http-codes');
const { HttpError } = require('../errors/http-error');
const uccelloUtils = require('../../Uccello2/system/utils');

// const HOST = "http://localhost:3000";
const HOST = "https://new.magisteria.ru";
const INVOICE_API = "/api/invoices";

let users = [
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" },
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" },
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" },
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" },
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" },
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" },
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" },
    { login: "test@magisteria.ru", password: "admin" },
    { login: "sokolov@rosebud.ru", password: "12345" },
    { login: "staloverov@rosebud.ru", password: "12345" }
];

function createInvoice(token, userId) {
    return new Promise((resolve, reject) => {
        let invoice = {
            UserId: userId,
            InvoiceTypeId: 1,
            Items: [
                { ProductId: 3 }
            ]
        };
        request.post(
            {
                url: HOST + INVOICE_API,
                headers: { "Authorization": "JWT " + token },
                json: true,
                body: invoice
            }, (error, response, body) => {
                try {
                    if (error)
                        reject(error)
                    else {
                        if (response.statusCode === HttpCode.OK)
                            resolve(body)
                        else
                            reject(new HttpError(response.statusCode, HttpMessage[response.statusCode]));
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
    });
}

function userCreateInvoiceTest(user, password, num) {
    let stTime;
    let currNum = 0;
    return new Promise(resolve => {
        resolve(login(HOST, user, password, true));
    })
        .then(result => {
            stTime = new Date();
            return uccelloUtils.seqExec(num, n => {
                return createInvoice(result.token, result.user.Id)
                    .then(result => {
                        currNum++;
                    });
            })
        })
        .then(() => {
            let time = ((new Date()) - stTime) / 1000;
            return { isErr: false, result: { num: currNum, time: time, rate: (time > 10e-6 ? (currNum / time) : 0) } };
        })
        .catch(err => {
            let time = ((new Date()) - stTime) / 1000;
            return {
                isErr: true,
                error: (err instanceof Error ? err.message : JSON.stringify(err)),
                result: { num: currNum, time: time, rate: (time > 10e-6 ? (currNum / time) : 0) }
            };
        })
}

function createInvoiceTest(num) {
    return new Promise(resolve => {
        let promises = [];
        users.forEach(elem => {
            promises.push(userCreateInvoiceTest(elem.login, elem.password, num));
        });
        resolve(Promise.all(promises));
    })
}

exports.CreateInvoice = {
    createInvoiceTest: createInvoiceTest
};