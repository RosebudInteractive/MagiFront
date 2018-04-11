const config = require('config');
const path = require('path');
const mime = require('mime');
const { AccessRights } = require('../security/access-rights');
const { HttpCode } = require("../const/http-codes");

let uploadPath = config.get('uploadPath');

exports.setupProtectedStatic = (app) => {
    app.use('/data', (req, res, next) => {
        AccessRights.canAccessFile(req.user, req.url)
            .then((canAccess) => {
                if (canAccess) {
                    let isNginxProxy = req.get('X-NginX-Proxy') === "true";
                    let nginxStatic = req.get('X-NginX-Static');
                    if (isNginxProxy && nginxStatic) {
                        let url = '/' + nginxStatic + req.url;
                        res.set('X-Accel-Redirect', url);
                        res.send();
                    } else {
                        let fn = path.join(uploadPath, decodeURIComponent(req.url));
                        res.sendFile(fn);
                    }
                }
                else
                    return res.status(HttpCode.ERR_UNAUTH).json({ message: "Can't access file: " + req.url + "." });
            })
            .catch((err) => {
                next(err);
            });
    });
}
