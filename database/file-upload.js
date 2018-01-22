const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const formidable = require('formidable')

const path = require('path')
const fs = require('fs')

const sharp = require('sharp');
//const sizeOf = require('image-size');

const audioMeta = require('music-metadata');

const std_sizes = [
    { lbl: "s", sz: 360 },
    { lbl: "m", sz: 768 },
    { lbl: "l", sz: 1366 }
];
const icon_sz = 150;

const HTTP_OK = 200;
const HTTP_SERVER_ERR = 500;

function intFmtWithLeadingZeros(val, width) {
    let res = val.toString();
    let rest = width - res.length;
    if (rest > 0)
        for (let i = 0; i < rest; i++)
            res = "0" + res;
    return res;
}

function processOther(file_name, mime_type, size, dir, dir_suffix, files, all_files) {

    return new Promise((resolve, reject) => {
        let file_info = { "mime-type": mime_type };
        let file_desc = { file: dir_suffix + file_name, info: file_info };
        let full_dir = path.join(dir, dir_suffix);
        let full_name = path.join(full_dir, file_name);
        all_files.push(full_name);
        files.push(file_desc);
        resolve();
    });
}

function processAudio(file_name, mime_type, size, dir, dir_suffix, files, all_files) {

    return new Promise((resolve, reject) => {
        let file_info = { "mime-type": mime_type, filesize: size };
        let file_desc = { file: dir_suffix + file_name, info: file_info };
        let full_dir = path.join(dir, dir_suffix);
        let full_name = path.join(full_dir, file_name);
        all_files.push(full_name);
        resolve(
            audioMeta.parseFile(full_name, { duration: true, native: true })
                .then((metadata) => {
                    file_info.dataformat = metadata.format.dataformat;
                    file_info.bitrate = metadata.format.bitrate;
                    file_info.length = Math.ceil(metadata.format.duration);
                    file_info.length_formatted = intFmtWithLeadingZeros((file_info.length / 60) ^ 0, 2) +
                        ":" + intFmtWithLeadingZeros(file_info.length - ((file_info.length / 60) ^ 0) * 60, 2);
                    files.push(file_desc);
                })
        );
    });
}

function processImage(file_name, mime_type, size, dir, dir_suffix, files, all_files) {

    let file_info = { "mime-type": mime_type, path: dir_suffix, content: {} };
    let file_desc = { file: dir_suffix + file_name, info: file_info };
    let full_dir = path.join(dir, dir_suffix);
    let full_name = path.join(full_dir, file_name);
    all_files.push(full_name);

    const { name, ext } = path.parse(file_name);

    return new Promise((resolve, reject) => {
        resolve(
            sharp(full_name).metadata()
        );
    })
        .then((result) => {
            file_info.size = {};
            file_info.size.width = result.width;
            file_info.size.height = result.height;
            let res = Promise.resolve();
            let height = Math.round(result.height * icon_sz / result.width);
            let icon_fn = name + "-" + icon_sz + "x" + height + ext;
            file_info.icon = icon_fn;
            if (result.width <= icon_sz) {
                file_info.icon = file_name;
            }
            else {
                res = res.then(() => {
                    let out_full_name = path.join(full_dir, icon_fn);
                    return sharp(full_name).resize(icon_sz, height)
                        .toFile(out_full_name)
                        .then(() => {
                            all_files.push(out_full_name);
                        });
                });
            };
            res = res.then(() => {
                return Utils.seqExec(std_sizes, (elem) => {
                    let rc = Promise.resolve();
                    let fn = file_name;
                    if (result.width > elem.sz) {
                        let height = Math.round(result.height * elem.sz / result.width);
                        fn = name + "-" + elem.sz + "x" + height + ext;
                        let out_full_name = path.join(full_dir, fn);
                        rc = sharp(full_name).resize(elem.sz, height)
                            .toFile(out_full_name)
                            .then(() => {
                                all_files.push(out_full_name);
                            });
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
        const fileProcessors = {
            image: processImage,
            audio: processAudio
        };
        return (req, res, next) => {
            let res_files = [];
            let all_files = [];

            const processErr = (err) => {
                return Utils.seqExec(all_files, (elem) => {
                    return new Promise((resolve, reject) => {
                        fs.unlink(elem, (err) => {
                            err ? reject(err) : resolve();
                        })
                    });
                })
                    .then(() => {
                        res.status(HTTP_SERVER_ERR).json({ error: err });                    
                    })
                    .catch((err_io) => {
                        res.status(HTTP_SERVER_ERR).json({ error: err, error2: err_io });
                    })
            };

            let result = Promise.resolve();
            let now = new Date();
            let dir_year_suffix = now.getFullYear().toString() + "/";
            let dir_suffix = dir_year_suffix + intFmtWithLeadingZeros(now.getMonth() + 1, 2) + "/";
            let year_path = path.join(uploadDir, dir_year_suffix);
            let full_path = path.join(uploadDir, dir_suffix);

            if (!fs.existsSync(full_path)) {
                try {
                    if (!fs.existsSync(year_path))
                        fs.mkdirSync(year_path);
                    fs.mkdirSync(full_path);
                }
                catch (err) {
                    return processErr(err);
                };
            };

            const form = new formidable.IncomingForm();
            form.multiples = true
            form.keepExtensions = true
            form.uploadDir = uploadDir

            form.parse(req, (err, fields, files) => {
                if (err)
                    return processErr(err);
                result
                    .then(() => {
                        return res.status(HTTP_OK).json(res_files);
                    })
                    .catch((err) => {
                        return processErr(err);
                    });
            });

            form.on("fileBegin", (fname, file) => {
                const { name, ext } = path.parse(file.name);
                file.path = path.join(uploadDir, dir_suffix, `${name}${ext}`);
            });

            form.on("file", (fname, file) => {
                let types = file && file.type ? file.type.split("/") : null;
                if (types && (types.length > 0)) {
                    let fileProcessFn = fileProcessors[types[0]] ? fileProcessors[types[0]] : processOther;
                    result = result.then(() => {
                        return fileProcessFn(file.name, file.type, file.size, form.uploadDir, dir_suffix, res_files, all_files);
                    });
                    console.info("### Uploaded File: " + JSON.stringify(file.toJSON()));
                }
                else {
                    if (file)
                        all_files.push(file.path);
                    result = result.then(() => {
                        return Promise.reject(file ?
                            `Invalid or missing mime-type: "${file.type}", file: "${file.name}".` :
                            `Form: Missing "file" argument in a callback of "file" event.`);
                    });
                }
            });
        }
    }
};
