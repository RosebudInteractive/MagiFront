const config = require('config');
const path = require('path');
const { AuthenticateJWT } = require('../security/jwt-auth');

let uploadPath = config.get('uploadPath');

exports.setupProtectedStatic = (app) => {
    app.use('/data', AuthenticateJWT(app), (req, res) => {
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
    });
}
