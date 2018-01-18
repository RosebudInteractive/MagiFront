const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const formidable = require('formidable')
const path = require('path')

exports.FileUpload = {
    getFileUploadProc: (upload_dir) => {
        const uploadDir = upload_dir ? upload_dir : path.join(__dirname, '/..', '/..', '/uploads/')
        return (req, res, next) => {
            let files = [];
            const form = new formidable.IncomingForm()
            form.multiples = true
            form.keepExtensions = true
            form.uploadDir = uploadDir

            form.parse(req, (err, fields, files) => {
                if (err) return res.status(500).json({ error: err })
                res.status(200).json(files)
            })
            form.on("fileBegin", function (fname, file) {
                const { name, ext } = path.parse(file.name);
                file.path = path.join(uploadDir, `${name}${ext}`)
            })
            form.on("file", function (fname, file) {
                const fObj = file.toJSON();
                files.push(fObj);
                console.log("File: " + JSON.stringify(fObj));
            })
        }
    }
};
