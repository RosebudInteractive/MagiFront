const { HttpCode } = require("../const/http-codes");
const { InvoiceService } = require("../database/db-invoice");

function setupInvoices(app) {

    app.get('/api/adm/invoices/:id', (req, res, next) => {
        InvoiceService()
            .get(parseInt(req.params.id), { filter: req.query })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/invoices', (req, res, next) => {
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