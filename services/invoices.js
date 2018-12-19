const { HttpCode } = require("../const/http-codes");
const { InvoiceService } = require("../database/db-invoice");

function setupInvoices(app) {

    app.get('/api/invoices/:id', (req, res, next) => {
        InvoiceService()
            .get(parseInt(req.params.id), { filter: req.query })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/invoices', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            InvoiceService()
                .insert(req.body, { dbOptions: { userId: req.user.Id } })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });
}

exports.setupInvoices = setupInvoices;