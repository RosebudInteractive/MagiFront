import  DatabasePool from './db_connection';
import magisteryConfig from '../etc/config';


exports.EpisodesService = class EpisodesService {
    constructor() {
        this._pool = new DatabasePool(magisteryConfig);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve();
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

    // get(id) {
    //     return new Promise((resolve, reject) => {
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
    //     });
    // }
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
    // insert(data) {
    //     return new Promise((resolve, reject) => {
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
    //     });
    // }
}