const _ = require('lodash');
const { HttpCode } = require("../const/http-codes");
let { TestService } = require("../database/db-test");

function setupTests(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.tests = TestService;

    app.get('/api/tests/course/:course_id', async (req, res, next) => {
        try {
            let user_id = req.user ? req.user.Id : 0;
            let options = _.cloneDeep(req.query);
            if (user_id)
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
        TestService()
            .getTestInstance(req.params.id, { dbOptions: {} })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.post('/api/tests/instance', async (req, res, next) => {
        try {
            let test_id = req.body && req.body.TestId ? req.body.TestId : null;
            if (!test_id)
                res.status(HttpCode.ERR_BAD_REQ).json({ message: 'Invalid or missing "TestId" arg.' })
            else {
                let userId = req.user ? req.user.Id : null;
                let options = { params: req.body };
                if (userId)
                    options.dbOptions = { userId: userId };
                let rows = await TestService()
                    .createTestInstance(userId, test_id, options);
                res.send(rows);
            }
        }
        catch (err) {
            next(err);
        }
    });

    app.post('/api/tests/instance/share', async (req, res, next) => {
        try {
            let instance_id = req.body && req.body.InstanceId ? req.body.InstanceId : null;
            if (!instance_id)
                res.status(HttpCode.ERR_BAD_REQ).json({ message: 'Invalid or missing "instance_id" arg.' })
            let options = {};
            if (req.user)
                options.dbOptions = { userId: req.user.Id };
            let rows = await TestService()
                .createSharedInstance(instance_id, options);
            res.send(rows);
        }
        catch (err) {
            next(err);
        }
    });

    app.get('/api/tests/instance/share/:id', async (req, res, next) => {
        try {
            let options = _.cloneDeep(req.query);
            if (req.user)
                options.dbOptions = { userId: req.user.Id };
            let rows = await TestService()
                .getSharedInstance(req.params.id, options);
            res.send(rows);
        }
        catch (err) {
            next(err);
        }
    });

    app.put('/api/tests/instance/:id', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            TestService()
                .updateTestInstance(req.params.id, req.body, { dbOptions: { userId: req.user.Id } })
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