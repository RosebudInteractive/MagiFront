const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const formidable = require('formidable')

const path = require('path')
const fs = require('fs')

const sharp = require('sharp');
const sizeOf = require('image-size');
const util = require('util');

const std_sizes = [
    { lbl: "s", sz: 360 },
    { lbl: "m", sz: 768 },
    { lbl: "l", sz: 1366 }
];
const icon_sz = 150;

function processImage(file_name, mime_type, dir, dir_suffix, files) {

    let file_info = { "mime-type": mime_type, path: dir_suffix, content: {} };
    let file_desc = { file: dir_suffix + file_name, info: file_info };
    let full_dir = path.join(dir, dir_suffix);
    let full_name = path.join(full_dir, file_name);

    const { name, ext } = path.parse(file_name);

    return new Promise((resolve, reject) => {
        sizeOf(full_name, (err, dimensions) => {
            err ? reject(err) : resolve(dimensions);
        })
    })
        .then((result) => {
            file_info.size = {};
            file_info.size.width = result.width;
            file_info.size.height = result.height;
            let res = Promise.resolve();
            let height = Math.round(result.height * icon_sz / result.width);
            let icon_fn = name + "_" + icon_sz + "x" + height + ext;
            file_info.icon = icon_fn;
            if (result.width <= icon_sz) {
                file_info.icon = file_name;
            }
            else {
                res = res.then(() => {
                    return sharp(full_name).resize(icon_sz, height)
                        .toFile(path.join(full_dir, icon_fn));
                });
            };
            res = res.then(() => {
                return Utils.seqExec(std_sizes, (elem) => {
                    let rc = Promise.resolve();
                    let fn = file_name;
                    if (result.width > elem.sz) {
                        let height = Math.round(result.height * elem.sz / result.width);
                        fn = name + "_" + elem.sz + "x" + height + ext;;
                        rc = sharp(full_name).resize(elem.sz, height)
                            .toFile(path.join(full_dir, fn));
                    }
                    return rc.then(() => {
                        if (result.width >= elem.sz)
                            file_info.content[elem.lbl] = fn;
                    });
                });
            });
            return res.then(() => {
                files.push(file_desc);
            });
        });
}

exports.FileUpload = {
    getFileUploadProc: (upload_dir) => {
        const uploadDir = upload_dir ? path.join(upload_dir, "/") : path.join(__dirname, "/..", "/..", "/uploads/");

        return (req, res, next) => {
            let res_files = [];
            let all_files = [];

            let result = Promise.resolve();
            let now = new Date();
            let dir_year_suffix = now.getFullYear().toString() + "/";
            let dir_suffix = dir_year_suffix + (now.getMonth() > 8 ?
                (now.getMonth() + 1).toString() : ("0" + (now.getMonth() + 1).toString())) + "/";
            let year_path = path.join(uploadDir, dir_year_suffix);
            let full_path = path.join(uploadDir, dir_suffix);

            if (!fs.existsSync(full_path)) {
                try {
                    if (!fs.existsSync(year_path))
                        fs.mkdirSync(year_path);
                    fs.mkdirSync(full_path);
                }
                catch (err) {
                    return res.status(500).json({ error: err });
                };
            };

            const form = new formidable.IncomingForm();
            form.multiples = true
            form.keepExtensions = true
            form.uploadDir = uploadDir

            form.parse(req, (err, fields, files) => {
                if (err) return res.status(500).json({ error: err });
                result
                    .then(() => {
                        return res.status(200).json(res_files);
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: err });
                    });
            });

            form.on("fileBegin", function (fname, file) {
                const { name, ext } = path.parse(file.name);
                file.path = path.join(uploadDir, dir_suffix, `${name}${ext}`);
            });

            form.on("file", function (fname, file) {
                let types = file.type.split("/");
                if (types && (types.length > 0)) {
                    if (types[0] === "image") {
                        result = result.then(() => {
                            return processImage(file.name, file.type, form.uploadDir, dir_suffix, res_files);
                        })
                    }
                    const fObj = file.toJSON();
                    console.log("File: " + JSON.stringify(fObj));
                }
            });
        }
    }
};
