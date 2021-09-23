const _ = require('lodash');
const config = require('config');
const { RoleService } = require('./role-api');
const { getTimeStr, buildLogString } = require('../../utils');

function setupRoles(app) {

    const pmEnabled = config.has("server.pmEnabled") && (config.server.pmEnabled === true) ? true : false;

    if (!global.$Services)
        global.$Services = {};
    global.$Services.role = RoleService;

    if (app) {

        app.get(`/api/permission-scheme`, async (req, res, next) => {
            try {
                let opts = _.cloneDeep(req.query);
                let rows = await RoleService().getPermissionScheme(opts);
                res.send(rows);
            }
            catch (err) {
                next(err);
            }
        });

        if (pmEnabled) {
            app.get(`/api/pm/role-list`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await RoleService().getRoleList(opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.get(`/api/pm/role/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await RoleService().getRole(parseInt(req.params.id), opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.post(`/api/pm/role`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await RoleService().newRole(req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.put(`/api/pm/role/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await RoleService().updateRole(parseInt(req.params.id), req.body, opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });

            app.delete(`/api/pm/role/:id`, async (req, res, next) => {
                try {
                    let opts = _.defaultsDeep({ user: req.user }, req.query);
                    let rows = await RoleService().deleteRole(parseInt(req.params.id), opts);
                    res.send(rows);
                }
                catch (err) {
                    next(err);
                }
            });
        }
    }
}

exports.setupRoles = setupRoles;