const { HttpCode } = require("../const/http-codes");
const { UsersService } = require('../database/db-user');

function setupUsers(app) {

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

    app.get('/api/users/bookmark-ext', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getExtBookmarks(req.user.Id)
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

    app.get('/api/users/bookmark', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .getBookmark(req.user.Id)
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
                .getHistory(req.user.Id)
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
        else
            UsersService()
                .update(req.user.Id, req.body, { userId: req.user.Id })
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

}

exports.setupUsers = setupUsers;