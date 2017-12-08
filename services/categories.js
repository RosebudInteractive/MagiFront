//let { CategoriesService } = require('./../database/category');
let { CategoriesService } = require('./../database/db-category');

function setupCategories(app) {
    app.get('/api/categories', (req, res, next) => {
        CategoriesService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/categories/:id', (req, res, next) => {
        CategoriesService()
            .get(req.params.id)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/categories', (req, res, next) => {
        CategoriesService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/categories/:id', (req, res, next) => {
        CategoriesService()
            .update(req.params.id, req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/categories/:id', (req, res, next) => {
        CategoriesService()
            .del(req.params.id)
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupCategories = setupCategories;