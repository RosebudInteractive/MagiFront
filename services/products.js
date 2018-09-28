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
}

exports.setupProducts = setupProducts;