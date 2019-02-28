const { HttpCode } = require("../const/http-codes");
const { HttpError } = require('../errors/http-error');
const { BookService } = require("../database/db-book");

function setupBooks(app) {

    app.get('/api/adm/books', (req, res, next) => {
        BookService()
            .get()
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/adm/books', (req, res, next) => {
        BookService()
            .update(req.body, { dbOptions: { userId: req.user.Id } })
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupBooks = setupBooks;