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

    app.post('/api/adm/authors', (req, res, next) => {
        AuthorsService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/authors/:id', (req, res, next) => {
        AuthorsService()
            .update(parseInt(req.params.id), req.body)
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