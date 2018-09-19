let { AuthorsService } = require('./../database/db-author');

function setupAuthors(app) {

    app.get('/api/authors/:url', (req, res, next) => {
        AuthorsService()
            .getPublic(req.params.url)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/authors/prerender/:id', (req, res, next) => {
        new Promise((resolve, reject) => {
            let id = (req.query && req.query.url) ? req.query.url : parseInt(req.params.id);
            if ((typeof (id) === "number") && isNaN(id))
                throw new Error(`Invalid parameter: ${req.params.id}`);
            let rc = AuthorsService()
                .prerender(id);
            resolve(rc);
        })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/authors/:id', (req, res, next) => {
        AuthorsService()
            .get(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/authors', (req, res, next) => {
        AuthorsService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/authors', (req, res, next) => {
        AuthorsService()
            .insert(req.body, { userId: req.user.Id })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/authors/:id', (req, res, next) => {
        AuthorsService()
            .update(parseInt(req.params.id), req.body, { userId: req.user.Id })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/adm/authors/:id', (req, res, next) => {
        AuthorsService()
            .del(parseInt(req.params.id))
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupAuthors = setupAuthors;