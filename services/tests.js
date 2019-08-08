let { TestService } = require("../database/db-test");

function setupTests(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.tests = TestService;

    app.get('/api/adm/tests/list', (req, res, next) => {
        TestService()
            .getList(req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/tests/types', (req, res, next) => {
        TestService()
            .getTypes(req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/tests/:id', (req, res, next) => {
        TestService()
            .get(parseInt(req.params.id), req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/adm/tests', (req, res, next) => {
        TestService()
            .insert(req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/tests/:id', (req, res, next) => {
        TestService()
            .update(parseInt(req.params.id), req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/adm/tests/:id', (req, res, next) => {
        TestService()
            .del(parseInt(req.params.id), { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupTests = setupTests;