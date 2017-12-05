var { DatabasePool } = require("./db_connection");
var { magisteryConfig } = require("../etc/config")

const authorRows = [
    {
        id : 1,
        AccountId : 1,
        LanguageId : 1,
        Portrait : 'http://example.image1.ru',
        FirstName : 'Петр',
        LastName : 'Петров',
        Description : 'Наш первый тестовый автор'
    },
    {
        id : 2,
        AccountId : 1,
        LanguageId : 1,
        Portrait : 'http://example.image2.ru',
        FirstName : 'Сергей',
        LastName : 'Сергеев',
        Description : 'Наш второй тестовый автор'
    },
    {
        id : 3,
        AccountId : 1,
        LanguageId : 1,
        Portrait : 'http://example.image3.ru',
        FirstName : 'Платон',
        LastName : 'Кузнецов',
        Description : 'Наш третий тестовый автор'
    },
];

exports.AuthorsService = class AuthorsService {
    constructor() {
        this._pool = new DatabasePool(magisteryConfig);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(authorRows);
            // this._pool.getConnection()
            //     .then(connection => {
            //         connection.query("SELECT " +
            //             "episode_id as id, code, name, active, created, updated " +
            //             "FROM episode " +
            //             "order by updated", (err, rows) => {
            //             connection.release();
            //             if (err) {
            //                 reject(err)
            //                 return;
            //             }
            //             resolve(rows);
            //         });
            //     })
            //     .catch(err => {
            //         reject(err);
            //     });
        });
    }

    get(id) {
        return new Promise((resolve, reject) => {
            resolve(authorRows[0])
    //         this._pool.getConnection()
    //             .then(connection => {
    //                 connection.query("SELECT " +
    //                     "episode_id as id, code, name, active, created, updated " +
    //                     "FROM episode where episode_id = ?", [id], (err, rows) => {
    //                     connection.release();
    //                     if (err) {
    //                         reject(err)
    //                         return;
    //                     }
    //                     resolve(rows[0]);
    //                 });
    //             })
    //             .catch(err => {
    //                 reject(err);
    //             });
        });
    }
    //
    // del(id) {
    //     return new Promise((resolve, reject) => {
    //         this._pool.getConnection()
    //             .then(connection => {
    //                 connection.query("delete from episode where episode_id = ?", [id], (err, ok) => {
    //                     connection.release();
    //                     if (err) {
    //                         reject(err)
    //                         return;
    //                     }
    //
    //                     if (ok.affectedRows == 0) {
    //                         reject(new Error("Record not found"))
    //                         return;
    //                     }
    //                     resolve(null);
    //                 });
    //             })
    //             .catch(err => {
    //                 reject(err);
    //             });
    //     });
    // }
    //
    // update(id, data) {
    //     return new Promise((resolve, reject) => {
    //         this._pool.getConnection()
    //             .then(connection => {
    //                 connection.query("update episode " +
    //                     "set " +
    //                     "code = ?, " +
    //                     "name = ?, " +
    //                     "active = ? " +
    //                     "where episode_id = ?", [data.code, data.name, data.active, id], (err, ok) => {
    //                     connection.release();
    //                     if (err) {
    //                         reject(err)
    //                         return err;
    //                     }
    //
    //                     this.get(id).then((data) => {
    //                         resolve(data)
    //                     }).catch((err) => {
    //                         reject(err);
    //                     })
    //                 });
    //             })
    //             .catch(err => {
    //                 reject(err);
    //             });
    //     });
    // }
    //
    insert(data) {
        return new Promise((resolve, reject) => {
            console.log(data);
            resolve(authorRows[0]);
    //         this._pool.getConnection()
    //             .then(connection => {
    //                 connection.query("insert into episode (code, name, active) " +
    //                     "values (?, ?, ?)", [data.code, data.name, data.active], (err, ok) => {
    //                     connection.release();
    //                     if (err) {
    //                         reject(err)
    //                         return err;
    //                     }
    //                     this.get(ok.insertId).then((data) => {
    //                         resolve(data)
    //                     }).catch((err) => {
    //                         reject(err);
    //                     })
    //
    //                 });
    //             })
    //             .catch(err => {
    //                 reject(err);
    //             });
        });
    }
}