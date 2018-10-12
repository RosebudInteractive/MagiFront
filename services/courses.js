//let { CoursesService } = require('./../database/courses');
let { CoursesService } = require('./../database/db-course');

function setupCourses(app) {
    // app.get('/api/courses-lng/:lessonId', (req, res, next) => {
    app.get('/api/courses', (req, res, next) => {
        CoursesService()
            // .getAllPublic(parseInt(req.params.lessonId))
            .getAllPublic(req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/courses/:url', (req, res, next) => {
        CoursesService()
            .getPublic(req.params.url, req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/courses/prerender/:id', (req, res, next) => {
        new Promise((resolve, reject) => {
            let id = (req.query && req.query.url) ? req.query.url : parseInt(req.params.id);
            if ((typeof (id) === "number") && isNaN(id))
                throw new Error(`Invalid parameter: ${req.params.id}`);
            let rc = CoursesService()
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

    app.get('/api/adm/courses/:id/authors', (req, res, next) => {
        CoursesService()
            .getAuthors(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/courses/:id', (req, res, next) => {
        CoursesService()
            .get(parseInt(req.params.id))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/courses', (req, res, next) => {
        CoursesService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/courses', (req, res, next) => {
        CoursesService()
            .insert(req.body, { userId: req.user.Id })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/courses/:id', (req, res, next) => {
        CoursesService()
            .update(parseInt(req.params.id), req.body, { userId: req.user.Id })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/adm/courses/:id', (req, res, next) => {
        CoursesService()
            .del(parseInt(req.params.id))
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupCourses = setupCourses;