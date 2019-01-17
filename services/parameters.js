let { ParametersService } = require('./../database/db-parameter');

function setupParameters(app) {

    app.get('/api/parameters', (req, res, next) => {
        ParametersService()
            .getAllParameters(true)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/parameters', (req, res, next) => {
        ParametersService()
            .getAllParameters()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/parameters', (req, res, next) => {
        ParametersService()
            .update(req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupParameters = setupParameters;