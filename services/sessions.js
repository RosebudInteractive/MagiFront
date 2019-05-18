'use strict'
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../const/http-codes");
const { SessionService } = require('../database/db-session');

exports.SetupRoute = (app) => {

    app.get("/api/adm/sessions/stat", async (req, res, next) => {
        if (req.user) {
            try {
                let result = await SessionService().getStat(req.query);
                res.header("Content-Type", "text/csv; charset=UTF-8");
                if (result.filename)
                    res.header("Content-Disposition", `attachment; filename="${result.filename}"`);
                res.send(result.content);
            }
            catch (err) {
                next(err);
            };
        }
        else
            res.status(HttpCode.ERR_UNAUTH).json({ message: "Not authorized." });
    });
};