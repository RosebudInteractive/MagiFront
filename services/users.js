const _ = require('lodash');
const { HttpCode } = require("../const/http-codes");
const { UsersService } = require('../database/db-user');
const { InvoiceService } = require('../database/db-invoice');

const ALLOWED_TO_EDIT = {
    "Name": true,
    "DisplayName": true,
    "SubsAutoPay": true,
    "SubsAutoPayId": true,
    "SubsProductId": true
}

function setupUsers(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.users = UsersService;

    app.get('/api/users/not-sent-trans', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getNotSentTrans(req.user.Id)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.post('/api/users/send-trans', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .markTransAsSent(req.user.Id, req.body)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/invoice', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            InvoiceService()
                .get(null, { filter: { user_id: req.user.Id, state_id: 3 } })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/bookmark', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getShortBookmarks(req.user.Id)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/bookmark-app', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getShortBookmarks(req.user.Id, true)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/bookmark-ext', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getExtBookmarks(req.user, req.query)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/paid/courses', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getPaidCourses(req.user, false, req.query)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/paid/courses-ext', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getPaidCourses(req.user, true, req.query)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.post('/api/users/bookmark/:course_url/:lesson_url', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .insBookmark(req.user.Id, req.params.course_url, req.params.lesson_url)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.post('/api/users/bookmark/:course_url', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .insBookmark(req.user.Id, req.params.course_url)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.delete('/api/users/bookmark/:course_url/:lesson_url', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .delBookmark(req.user.Id, req.params.course_url, req.params.lesson_url)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.delete('/api/users/bookmark/:course_url', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .delBookmark(req.user.Id, req.params.course_url)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/history', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getHistory(req.user, null, req.query)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users/subs-info', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getSubsInfo(req.user.Id)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.get('/api/users', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getPublic(req.user)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

    app.put('/api/users', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else {
            req.body.allowedToEdit = _.cloneDeep(ALLOWED_TO_EDIT);
            UsersService()
                .update(req.user.Id, req.body, { userId: req.user.Id })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
        }
    });

}

exports.setupUsers = setupUsers;