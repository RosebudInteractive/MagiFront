let { LessonsService } = require('./../database/lessons');
// let { LessonsService } = require('./../database/db-lesson');

function setupLessons(app) {
    // app.get('/api/lessons', (req, res, next) => {
    //     LessonsService()
    //         .getAll()
    //         .then(rows => {
    //             res.send(rows);
    //         })
    //         .catch(err => {
    //             next(err);
    //         });
    // });

    app.get('/api/lessons/:id', (req, res, next) => {
        LessonsService()
            .get(req.params.id)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/lessons', (req, res, next) => {
        LessonsService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/lessons/:id', (req, res, next) => {
        LessonsService()
            .update(req.params.id, req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/lessons/:id', (req, res, next) => {
        LessonsService()
            .del(req.params.id)
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupLessons = setupLessons;