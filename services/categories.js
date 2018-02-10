//let { CategoriesService } = require('./../database/category');
let { CategoriesService } = require('./../database/db-category');
let { AuthenticateJWT } = require('../security/jwt-auth');

function setupCategories(app) {
    app.get('/api/categories', AuthenticateJWT(app), (req, res, next) => {
        CategoriesService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/categories/:id', AuthenticateJWT(app), (req, res, next) => {
        CategoriesService()
            .get(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/categories', AuthenticateJWT(app), (req, res, next) => {
        CategoriesService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/categories/:id', AuthenticateJWT(app), (req, res, next) => {
        CategoriesService()
            .update(parseInt(req.params.id), req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/categories/:id', AuthenticateJWT(app), (req, res, next) => {
        CategoriesService()
            .del(parseInt(req.params.id))
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupCategories = setupCategories;