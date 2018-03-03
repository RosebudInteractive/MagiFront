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
}

exports.setupLanguages = setupLanguages;