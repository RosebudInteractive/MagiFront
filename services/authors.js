var { EpisodesService } = require("../database/episodes");

export default function setupAuthors(app) {
    app.get('/api/authors', function(req, res, next) {
        new EpisodesService().getAll().then(rows => {
            res.send(rows);
        }).catch(err => {
            next(err);
        });
    });

    app.post('/api/episodes', function(req, res) {
        new EpisodesService().insert(req.body).then(rows => {
            res.send(rows);
        }).catch(err => {
            next(err);
        });
    });

    app.get('/api/episodes/:id', function(req, res) {
        res.send('This is not implemented now');
    });

    app.put('/api/episodes/:id', function (req, res){
        new EpisodesService().update(req.params.id, req.body).then(rows => {
            res.send(rows);
        }).catch(err => {
            next(err);
        });
    });

    app.delete('/api/episodes/:id', function (req, res, next){
        new EpisodesService().del(req.params.id).then(() => {
            res.send({});
        }).catch(err => {
            next(err);
        });
    });
}
