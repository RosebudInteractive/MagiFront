let { LanguagesService } = require('./../database/db-language');
// let { CoursesService } = require('./../database/db-course');

function setupLanguages(app) {
    app.get('/api/languages', (req, res, next) => {
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