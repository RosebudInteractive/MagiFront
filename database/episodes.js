const _rows = [
    {
        Id: 1,
        Name: 'Эпизод 1',
        Number: '1',
        Audio: '/assets/audio/1.mp3',
        State: 'D',
        EpisodeType: 'L',
        Supp: false,
        Transcript: 'Описание 1'
    },
    {
        Id: 2,
        Name: 'Эпизод 2',
        Number: '2',
        Audio: '/assets/audio/1.mp3',
        State: 'R',
        EpisodeType: 'L',
        Supp: false,
        Transcript: 'Описание 2'
    },
    {
        Id: 3,
        Name: 'Эпизод 3',
        Number: '3',
        Audio: '/assets/audio/1.mp3',
        State: 'A',
        EpisodeType: 'L',
        Supp: true,
        Transcript: 'Описание 3'
    },
];

var { DatabasePool } = require("./db_connection");
var { magisteryConfig } = require("../etc/config");


const EpisodesService = class EpisodesService {
    get(id, lessonId) {
        return new Promise((resolve) => {
            resolve(_rows[0])
        });
    }

    del(id, lessonId) {
        return new Promise((resolve) => {
            console.log(id);
            resolve(null);
        });
    }

    update(id, lessonId, data) {
        return new Promise((resolve) => {
            console.log(id, data);
            resolve(data);
        });
    }

    insert(lessonId, data) {
        return new Promise((resolve) => {
            console.log(data);
            resolve(_rows[0]);
        });
    }
};

class OldEpisodesService {
    constructor() {
        this._pool = new DatabasePool(magisteryConfig);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this._pool.getConnection()
                .then(connection => {
                    connection.query("SELECT " +
                        "episode_id as id, code, name, active, created, updated " +
                        "FROM episode " +
                        "order by updated", (err, rows) => {
                        connection.release();
                        if (err) {
                            reject(err)
                            return;
                        }
                        resolve(rows);
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    get(id) {
        return new Promise((resolve, reject) => {
            this._pool.getConnection()
                .then(connection => {
                    connection.query("SELECT " +
                        "episode_id as id, code, name, active, created, updated " +
                        "FROM episode where episode_id = ?", [id], (err, rows) => {
                        connection.release();
                        if (err) {
                            reject(err)
                            return;
                        }
                        resolve(rows[0]);
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    del(id) {
        return new Promise((resolve, reject) => {
            this._pool.getConnection()
                .then(connection => {
                    connection.query("delete from episode where episode_id = ?", [id], (err, ok) => {
                        connection.release();
                        if (err) {
                            reject(err)
                            return;
                        }

                        if (ok.affectedRows == 0) {
                            reject(new Error("Record not found"))
                            return;
                        }
                        resolve(null);
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            this._pool.getConnection()
                .then(connection => {
                    connection.query("update episode " +
                        "set " +
                        "code = ?, " +
                        "name = ?, " +
                        "active = ? " +
                        "where episode_id = ?", [data.code, data.name, data.active, id], (err, ok) => {
                        connection.release();
                        if (err) {
                            reject(err)
                            return err;
                        }

                        this.get(id).then((data) => {
                            resolve(data)
                        }).catch((err) => {
                            reject(err);
                        })
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    insert(data) {
        return new Promise((resolve, reject) => {
            this._pool.getConnection()
                .then(connection => {
                    connection.query("insert into episode (code, name, active) " +
                        "values (?, ?, ?)", [data.code, data.name, data.active], (err, ok) => {
                        connection.release();
                        if (err) {
                            reject(err)
                            return err;
                        }
                        this.get(ok.insertId).then((data) => {
                            resolve(data)
                        }).catch((err) => {
                            reject(err);
                        })

                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}

let dbEpisodes = null;
exports.LessonsService = () => {
    return dbEpisodes ? dbEpisodes : dbEpisodes = new EpisodesService();
};
