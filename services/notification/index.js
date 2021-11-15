const _ = require('lodash');
const config = require('config');
const { NotificationService } = require('./notification-api');
const { buildLogString } = require('../../utils');
const { AccessFlags } = require('../../const/common');
const { AccessRights } = require('../../security/access-rights');
const { HttpError } = require('../../errors/http-error');
const { HttpCode } = require("../../const/http-codes");

function checkIfAdmin(req) {
    let isAdmin = req && req.user ? (AccessRights.checkPermissions(req.user, AccessFlags.Administrator) !== 0) : false;
    if (!isAdmin)
        throw new HttpError(HttpCode.ERR_FORBIDDEN, `Access denied.`);
}

function setupNotifications(app) {

    let NotificationService;
    if (config.has('notifications.provider') && config.get('notifications.provider')) {
        NotificationService = require(`./providers/${config.get('notifications.provider')}`).NotificationService;
    }
    else
        NotificationService = require('./notification-api');
    
    if (!global.$Services)
        global.$Services = {};
    global.$Services.notifications = NotificationService;

    if (app) {

        app.post('/api/adm/notifications/send', async (req, res, next) => {
            try {
                checkIfAdmin(req);
                let options = _.clone(req.query);
                options.user = _.cloneDeep(req.user);
                let rows = await NotificationService().sendNotification(req.body, options);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.post('/api/adm/notifications/send-auto', async (req, res, next) => {
            try {
                checkIfAdmin(req);
                let options = _.clone(req.query);
                options.user = _.cloneDeep(req.user);
                let rows = await NotificationService().sendAutoNotifications(req.body, options);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        app.post('/api/adm/notifications', async (req, res, next) => {
            try {
                checkIfAdmin(req);
                let user_id = req.body && req.body.userId ? req.body.userId : req.user.Id;
                let options = _.clone(req.query);
                options.user = _.cloneDeep(req.user);
                let rows = await NotificationService().updateNotifications(user_id, options);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        // app.get(`/api/timelines/course/:id`, async (req, res, next) => {
        //     try {
        //         let opts = _.defaultsDeep({ CourseId: req.params.id, State: [2], SortOrder: "Order", isDetailed: true, allow_unauth: true }, req.query);
        //         let rows = await NotificationService().getTimelineList(opts);
        //         res.send(rows);
        //     }
        //     catch (err) {
        //         next(err);
        //     }
        // });
    }
}

exports.setupNotifications = setupNotifications;