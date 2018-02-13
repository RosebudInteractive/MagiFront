let { LanguagesService } = require('./../database/db-language');
// let { CoursesService } = require('./../database/db-course');
let { AuthenticateJWT } = require('../security/jwt-auth');

function setupLanguages(app) {
    app.get('/api/languages', AuthenticateJWT(app), (req, res, next) => {
        LanguagesService()
            .getAll()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    // app.get('/api/courses/:id', (req, res, next) => {
    //     CoursesService()
    //         .get(req.params.id)
    //         .then(rows => {
    //             res.send(rows);
    //         })
    //         .catch(err => {
    //             next(err);
    //         });
    // });

    // app.post('/api/courses', (req, res, next) => {
    //     CoursesService()
    //         .insert(req.body)
    //         .then(rows => {
    //             res.send(rows);
    //         })
    //         .catch(err => {
    //             next(err);
    //         });
    // });

    // app.put('/api/courses/:id', (req, res, next) => {
    //     CoursesService()
    //         .update(req.params.id, req.body)
    //         .then(rows => {
    //             res.send(rows);
    //         })
    //         .catch(err => {
    //             next(err);
    //         });
    // });

    // app.delete('/api/courses/:id', (req, res, next) => {
    //     CoursesService()
    //         .del(req.params.id)
    //         .then(() => {
    //             res.send({});
    //         })
    //         .catch(err => {
    //             next(err);
    //         });
    // });
}

exports.setupLanguages = setupLanguages;