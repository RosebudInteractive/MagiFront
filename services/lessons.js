//let { LessonsService } = require('./../database/lessons');
let { LessonsService } = require('./../database/db-lesson');

function setupLessons(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.lesson = LessonsService;

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

    app.get('/api/adm/lessons/prerender/:id', (req, res, next) => {
        new Promise((resolve, reject) => {
            let id = (req.query && req.query.url) ? req.query.url : parseInt(req.params.id);
            if ((typeof (id) === "number") && isNaN(id))
                throw new Error(`Invalid parameter: ${req.params.id}`);
            let rc = LessonsService()
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

    app.get('/api/adm/lessons/:id/:courseId', (req, res, next) => {
        LessonsService()
            .get(parseInt(req.params.id), parseInt(req.params.courseId))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/play/:id', (req, res, next) => {
        LessonsService()
            .getPlayerData(parseInt(req.params.id), null, req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/v2/:course_url/:lesson_url', (req, res, next) => {
        LessonsService()
            .getLessonV2(req.params.course_url, req.params.lesson_url, req.user, req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons/v2/:id', (req, res, next) => {
        LessonsService()
            .getLessonV2(parseInt(req.params.id), null, req.user, req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/lessons-text/:course_url/:lesson_url', (req, res, next) => {
        LessonsService()
            .getLessonText(req.params.course_url, req.params.lesson_url, req.user)
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
            .getLesson(req.params.course_url, req.params.lesson_url, req.user)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/lessons/:courseId/:parentId', (req, res, next) => {
        LessonsService()
            .insert(req.body, parseInt(req.params.courseId),
                req.params.parentId ? parseInt(req.params.parentId) : null, { userId: req.user.Id })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/lessons/:id/:courseId/:parentId', (req, res, next) => {
        LessonsService()
            .update(parseInt(req.params.id), parseInt(req.params.courseId),
                req.body, req.params.parentId ? parseInt(req.params.parentId) : null, { userId: req.user.Id })
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