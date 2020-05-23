'use strict';
const { HttpCode } = require("../const/http-codes");
let { ElasticService } = require("../database/elastic");

function setupSearch(app) {

    app.post('/api/adm/search/import', async (req, res, next) => {
        try {
            let rows = await ElasticService().import(req.body);
            res.send(rows);
        }
        catch (err) {
            next(err);
        }
    });

}

exports.setupSearch = setupSearch;