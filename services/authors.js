let { AuthorsService } = require('./../database/authors');

function setupAuthors(app) {
    app.get('/api/authors', (req, res, next) => {
        new AuthorsService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/authors/:id', (req, res, next) => {
        new AuthorsService()
            .get(req.params.id)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/authors', (req, res, next) => {
        new AuthorsService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });



    app.put('/api/authors/:id', (req, res, next) => {
        new AuthorsService()
            .update(req.params.id, req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    // app.delete('/api/episodes/:id', function (req, res, next){
    //     new EpisodesService().del(req.params.id).then(() => {
    //         res.send({});
    //     }).catch(err => {
    //         next(err);
    //     });
    // });
}

exports.setupAuthors = setupAuthors