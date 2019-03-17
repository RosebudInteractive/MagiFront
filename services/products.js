let { ProductService } = require("../database/db-product");

function setupProducts(app) {
    app.get('/api/products', (req, res, next) => {
        ProductService()
            .get(req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/products', (req, res, next) => {
        ProductService()
            .insert(req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/products/:id', (req, res, next) => {
        ProductService()
            .update(parseInt(req.params.id), req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupProducts = setupProducts;