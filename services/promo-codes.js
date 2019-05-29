'use strict';
let { PromoCodeService } = require("../database/db-promo-code");

function setupPromoCodes(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.promo = PromoCodeService;

    app.get('/api/promo-codes', (req, res, next) => {
        PromoCodeService()
            .get(req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/promo-codes', (req, res, next) => {
        PromoCodeService()
            .insert(req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/promo-codes/:id', (req, res, next) => {
        PromoCodeService()
            .update(parseInt(req.params.id), req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/adm/promo-codes/:id', (req, res, next) => {
        PromoCodeService()
            .del(parseInt(req.params.id), { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupPromoCodes = setupPromoCodes;