/**
 * Created by levan.kiknadze on 14/11/2017.
 */

//let { EpisodesService } = require("../database/episodes");
let { EpisodesService } = require("../database/db-episode");
let { AuthenticateJWT } = require('../security/jwt-auth');

function setupEpisodes(app) {
    app.get('/api/episodes/:id/:lessonId', AuthenticateJWT(app), (req, res, next) => {
        EpisodesService()
            .get(parseInt(req.params.id), parseInt(req.params.lessonId))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    // app.get('/api/episodes', function(req, res, next) {
    //     new EpisodesService().getAll().then(rows => {
    //         res.send(rows);
    //     }).catch(err => {
    //         next(err);
    //     });
    // });

    app.post('/api/episodes/:lessonId', AuthenticateJWT(app), (req, res, next) => {
        EpisodesService()
            .insert(req.body, parseInt(req.params.lessonId))
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.put('/api/episodes/:id/:lessonId', AuthenticateJWT(app), (req, res, next) => {
        EpisodesService()
            .update(parseInt(req.params.id), parseInt(req.params.lessonId), req.body)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.delete('/api/episodes/:id/:lessonId', AuthenticateJWT(app), (req, res, next) => {
        EpisodesService()
            .del(parseInt(req.params.id), parseInt(req.params.lessonId))
            .then((result) => {
                res.send(result);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupEpisodes = setupEpisodes;