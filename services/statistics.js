'use strict';
let { StatisticsService } = require("../database/db-statistics");

function setupStatistics(app) {

    if (!global.$Services)
        global.$Services = {};
    global.$Services.statistics = StatisticsService;

    app.get('/api/adm/statistics/stat-report', (req, res, next) => {
        StatisticsService()
            .stat_report(req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });

    app.get('/api/adm/statistics/stat-report-by-campaign', (req, res, next) => {
        StatisticsService()
            .stat_report_by_campaign(req.query)
            .then(rows => {
                res.send(rows);
            })
            .catch(err => {
                next(err);
            });
    });
}

exports.setupStatistics = setupStatistics;