const { HttpCode } = require("../const/http-codes");
let { UsersService } = require('./../database/db-user');

function setupUsers(app) {

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

    app.put('/api/users', (req, res, next) => {
        if (!req.user)
            res.status(HttpCode.ERR_UNAUTH).json({ message: 'Authorization required!' })
        else
            UsersService()
                .update(req.user.Id, req.body)
                .then(rows => {
                    res.send(rows);
                })
                .catch(err => {
                    next(err);
                });
    });

}

exports.setupUsers = setupUsers;