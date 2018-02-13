//let { LessonsService } = require('./../database/lessons');
let { LessonsService } = require('./../database/db-lesson');

function setupLessons(app) {

    app.get('/api/adm/lessons/:id/:courseId/:parentId', (req, res, next) => {
        LessonsService()
            .get(parseInt(req.params.id), parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/lessons/resources/:id', (req, res, next) => {
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

    app.post('/api/adm/lessons/:courseId/:parentId', (req, res, next) => {
        LessonsService()
            .insert(req.body, parseInt(req.params.courseId), req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/lessons/:id/:courseId/:parentId', (req, res, next) => {
        LessonsService()
            .update(parseInt(req.params.id), parseInt(req.params.courseId), req.body, req.params.parentId ? parseInt(req.params.parentId) : null)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/adm/lessons/:id/:courseId', (req, res, next) => {
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