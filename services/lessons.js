//let { LessonsService } = require('./../database/lessons');
let { LessonsService } = require('./../database/db-lesson');

function setupLessons(app) {

    app.get('/api/lessons/:id/:courseId/:parentId', (req, res, next) => {
        LessonsService()
            .get(parseInt(req.params.id), parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/resources/:id', (req, res, next) => {
        LessonsService()
            .getResources(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/player/:id', (req, res, next) => {
        LessonsService()
            .getPlayerData(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/lessons/:courseId', (req, res, next) => {
        LessonsService()
            .insert(req.body, parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/lessons/:id/:courseId', (req, res, next) => {
        LessonsService()
            .update(parseInt(req.params.id), parseInt(req.params.courseId), req.body, req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/lessons/:id/:courseId', (req, res, next) => {
        LessonsService()
            .del(parseInt(req.params.id), parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupLessons = setupLessons;