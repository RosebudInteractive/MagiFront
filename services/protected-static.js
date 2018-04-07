const config = require('config');
const path = require('path');

let uploadPath = config.get('uploadPath');

exports.setupProtectedStatic = (app) => {
    app.use('/data', (req, res) => {
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