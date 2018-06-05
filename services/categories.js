//let { CategoriesService } = require('./../database/category');
let { CategoriesService } = require('./../database/db-category');

function setupCategories(app) {
    app.get('/api/adm/categories', (req, res, next) => {
        CategoriesService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/categories/:id', (req, res, next) => {
        CategoriesService()
            .get(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/categories', (req, res, next) => {
        CategoriesService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/categories/:id', (req, res, next) => {
        CategoriesService()
            .update(parseInt(req.params.id), req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/adm/categories/:id', (req, res, next) => {
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