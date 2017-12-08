//let { AuthorsService } = require('./../database/authors');
let { AuthorsService } = require('./../database/db-author');
let authorsService = null;

function setupAuthors(app) {
    app.get('/api/authors', (req, res, next) => {
        AuthorsService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/authors/:id', (req, res, next) => {
        AuthorsService()
            .get(req.params.id)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/authors', (req, res, next) => {
        AuthorsService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });



    app.put('/api/authors/:id', (req, res, next) => {
        AuthorsService()
            .update(req.params.id, req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/authors/:id', (req, res, next) => {
        AuthorsService()
            .del(req.params.id)
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupAuthors = setupAuthors