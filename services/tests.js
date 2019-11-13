const _ = require('lodash');
const { HttpCode } = require("../const/http-codes");
let { TestService } = require("../database/db-test");

function setupTests(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.tests = TestService;

    app.get('/api/tests/course/:course_id', async (req, res, next) => {
        try {
            let user_id = req.user ? req.user.Id : null;
            let options = _.defaultsDeep(req.query, { dbOpts: { userId: user_id } });
            options.dbOptions = { userId: user_id };
            let rows = await TestService()
                .getTestsByCourse(parseInt(req.params.course_id), user_id, options);
            res.send(rows);
        }
        catch (err) {
            next(err);
        };
    });

    app.get('/api/tests/instance/:id', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            TestService()
                .getTestInstance(parseInt(req.params.id), { dbOptions: { userId: req.user.Id } })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.post('/api/tests/instance', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else {
            let test_id = req.body && req.body.TestId ? req.body.TestId : null;
            if (!test_id)
                res.status(HttpCode.ERR_BAD_REQ).json({ message: 'Invalid or missing "test_id" arg.' })
            TestService()
                .createTestInstance(req.user.Id, test_id, { params: req.body, dbOptions: { userId: req.user.Id } })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
        }
    });

    app.put('/api/tests/instance/:id', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            TestService()
                .updateTestInstance(parseInt(req.params.id), req.body, { dbOptions: { userId: req.user.Id } })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.delete('/api/tests/instance/:id', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            TestService()
                .delTestInstance(parseInt(req.params.id), { dbOptions: { userId: req.user.Id } })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

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

    app.get('/api/tests/:url', (req, res, next) => {
        TestService()
            .getPublic(req.params.url, req.user, req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupTests = setupTests;