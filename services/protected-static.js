const config = require('config');
const path = require('path');
const mime = require('mime');
const { AccessRights } = require('../security/access-rights');
const { HttpCode } = require("../const/http-codes");

let uploadPath = config.get('uploadPath');
let dataUrl = config.get('dataUrl');
let oldDataUrl = config.get('oldDataUrl');
let downLoadUrl = config.get('downLoadUrl');

exports.setupProtectedStatic = (app, errorHandler) => {
    let dataProcessor = (req, res, next) => {
        let { name, ext } = path.parse(decodeURIComponent(req.path))
        if (false && (ext === ".mp3")) {
            console.log("=== DATA REQUEST ===");
            console.log("  OriginalUrl: " + req.originalUrl);
            console.log("  Ip: " + req.ip);
            console.log("=== START HEADERS ===");
            for (let h in req.headers)
                console.log(`    ${h}: "${req.headers[h]}"`);
            console.log("===  END HEADERS  ===");
        };
        AccessRights.canAccessFile(req.user, req.path)
            .then((canAccess) => {
                if (canAccess) {
                    let isNginxProxy = req.get('X-NginX-Proxy') === "true";
                    let nginxStatic = req.get('X-NginX-Static');
                    if (isNginxProxy && nginxStatic) {
                        let url = '/' + nginxStatic + req.path;
                        res.set('X-Accel-Redirect', url);
                        res.send();
                    } else {
                        let fn = path.join(uploadPath, decodeURIComponent(req.path));
                        res.sendFile(fn);
                    }
                }
                else
                    return res.status(HttpCode.ERR_UNAUTH).json({ message: "Can't access file: " + req.path + "." });
            })
            .catch((err) => {
                next(err);
            });
    };
    app.use(dataUrl, dataProcessor);
    app.use(oldDataUrl, dataProcessor);
    app.use(downLoadUrl, dataProcessor);
    if (errorHandler) {
        app.use(dataUrl, errorHandler);
        app.use(oldDataUrl, errorHandler);
        app.use(downLoadUrl, errorHandler);
    }
}
