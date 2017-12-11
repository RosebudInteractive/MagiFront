//let { CoursesService } = require('./../database/courses');
 let { CoursesService } = require('./../database/db-course');

function setupCourses(app) {
    app.get('/api/courses', (req, res, next) => {
        CoursesService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/courses/:id', (req, res, next) => {
        CoursesService()
            .get(req.params.id)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/courses', (req, res, next) => {
        CoursesService()
            .insert(req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/courses/:id', (req, res, next) => {
        CoursesService()
            .update(req.params.id, req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/courses/:id', (req, res, next) => {
        CoursesService()
            .del(req.params.id)
            .then(() => {
                res.send({});
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupCourses = setupCourses;