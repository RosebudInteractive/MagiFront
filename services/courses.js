//let { CoursesService } = require('./../database/courses');
let { CoursesService } = require('./../database/db-course');

function setupCourses(app) {
    app.get('/api/courses', (req, res, next) => {
        CoursesService()
            .getAllPublic()
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

    app.post('/api/adm/courses', (req, res, next) => {
        CoursesService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/courses/:id', (req, res, next) => {
        CoursesService()
            .update(parseInt(req.params.id), req.body)
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