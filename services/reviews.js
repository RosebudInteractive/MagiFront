'use strict';
const { HttpCode } = require("../const/http-codes");
let { ReviewService } = require("../database/db-review");

function setupReviews(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.review = ReviewService;

    app.get('/api/reviews', async (req, res, next) => {
        try {
            let rows = await ReviewService().get(req.query);
            res.send(rows);
        }
        catch (err) {
            next(err);
        }
    });

    app.post('/api/reviews', async (req, res, next) => {
        try {
            if (!req.user)
                res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
            else {
                let rows = await ReviewService().insert(req.body, { user: req.user, statusOverride: 2, dbOptions: { userId: req.user.Id } });
                res.send(rows);
            }
        }
        catch (err) {
            next(err);
        }
    });

    app.post('/api/adm/reviews', async (req, res, next) => {
        try {
            let rows = await ReviewService().insert(req.body, { user: req.user, dbOptions: { userId: req.user.Id } });
            res.send(rows);
        }
        catch (err) {
            next(err);
        }
    });

    app.put('/api/adm/reviews/:id', async (req, res, next) => {
        try {
            let rows = await ReviewService()
                .update(parseInt(req.params.id), req.body, { dbOptions: { userId: req.user.Id } });
            res.send(rows);
        }
        catch (err) {
            next(err);
        }
    });

    app.delete('/api/adm/reviews/:id', async (req, res, next) => {
        try {
            let rows = await ReviewService()
                .del(parseInt(req.params.id), { dbOptions: { userId: req.user.Id } });
            res.send(rows);
        }
        catch (err) {
            next(err);
        }
    });
}

exports.setupReviews = setupReviews;