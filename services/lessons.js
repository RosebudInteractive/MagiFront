//let { LessonsService } = require('./../database/lessons');
let { LessonsService } = require('./../database/db-lesson');
let { AuthenticateJWT } = require('../security/jwt-auth');

function setupLessons(app) {

    app.get('/api/adm/lessons/:id/:courseId', AuthenticateJWT(app), (req, res, next) => {
        LessonsService()
            .get(parseInt(req.params.id), parseInt(req.params.courseId))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/lessons/resources/:id', AuthenticateJWT(app), (req, res, next) => {
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

    app.get('/api/lessons-text/:course_url/:lesson_url', (req, res, next) => {
        LessonsService()
            .getLessonText(req.params.course_url, req.params.lesson_url)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons-all/:course_url/:lesson_url', (req, res, next) => {
        LessonsService()
            .getLessonsAll(req.params.course_url, req.params.lesson_url)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/:course_url/:lesson_url', (req, res, next) => {
        LessonsService()
            .getLesson(req.params.course_url, req.params.lesson_url)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/lessons/:courseId/:parentId', AuthenticateJWT(app), (req, res, next) => {
        LessonsService()
            .insert(req.body, parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/lessons/:id/:courseId/:parentId', AuthenticateJWT(app), (req, res, next) => {
        LessonsService()
            .update(parseInt(req.params.id), parseInt(req.params.courseId), req.body, req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/adm/lessons/:id/:courseId', AuthenticateJWT(app), (req, res, next) => {
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