//let { LessonsService } = require('./../database/lessons');
let { LessonsService } = require('./../database/db-lesson');
let { AuthenticateJWT } = require('../security/jwt-auth');

function setupLessons(app) {

    app.get('/api/lessons/:id/:courseId/:parentId', AuthenticateJWT(app), (req, res, next) => {
        LessonsService()
            .get(parseInt(req.params.id), parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/resources/:id', AuthenticateJWT(app), (req, res, next) => {
        LessonsService()
            .getResources(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/play/:id', (req, res, next) => {
        LessonsService()
            .getPlayerData(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/lessons/:courseId/:parentId', AuthenticateJWT(app), (req, res, next) => {
        LessonsService()
            .insert(req.body, parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/lessons/:id/:courseId/:parentId', AuthenticateJWT(app), (req, res, next) => {
        LessonsService()
            .update(parseInt(req.params.id), parseInt(req.params.courseId), req.body, req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/lessons/:id/:courseId', AuthenticateJWT(app), (req, res, next) => {
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