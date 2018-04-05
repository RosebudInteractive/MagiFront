const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const formidable = require('formidable');
const { DbUtils } = require('./db-utils');

const path = require('path');
const config = require('config');
const fs = require('fs');
const mime = require('mime');

const sharp = require('sharp');
//const sizeOf = require('image-size');

// Supported image formats
//console.log(sharp.format);

const audioMeta = require('music-metadata');

const std_sizes = [
    { lbl: "s", sz: 360 },
    { lbl: "m", sz: 768 },
    { lbl: "l", sz: 1366 }
];
const icon_sz = 150;

const HTTP_OK = 200;
const HTTP_SERVER_ERR = 500;

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
                    file_info.length_formatted = DbUtils.fmtDuration(file_info.length);
                    files.push(file_desc);
                })
        );
    });
}

function processImage(file_name, mime_type, size, dir, dir_suffix, files, all_files) {

    let file_info;
    let file_desc;
    let full_dir;
    let full_name;
    let name;
    let ext;

    return new Promise((resolve, reject) => {

        file_info = { "mime-type": mime_type, path: dir_suffix, content: {} };
        file_desc = { file: dir_suffix + file_name, info: file_info };
        full_dir = path.join(dir, dir_suffix);
        full_name = path.join(full_dir, file_name);
        all_files.push(full_name);

        let fobj = path.parse(file_name);
        name = fobj.name;
        ext = fobj.ext;

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

function makeDir(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, (err) => {
            if (err)
                reject(err)
            else
                resolve();
        });
    });
};

function makeUploadSubDir(uploadDir) {
    return new Promise((resolve, reject) => {
    
        let now = new Date();
        let dir_year_suffix = now.getFullYear().toString() + "/";
        let dir_suffix = dir_year_suffix + DbUtils.intFmtWithLeadingZeros(now.getMonth() + 1, 2) + "/";
        let year_path = path.join(uploadDir, dir_year_suffix);
        let full_path = path.join(uploadDir, dir_suffix);

        fs.stat(full_path, (err, stats) => {
            if (err) {
                if (err.code === "ENOENT") {
                    fs.stat(year_path, (err, stats) => {
                        if (err) {
                            if (err.code === "ENOENT") {
                                resolve(
                                    makeDir(year_path)
                                        .then(() => {
                                            return makeDir(full_path);
                                        })
                                        .then(() => {
                                            return dir_suffix;
                                        })
                                );
                            }
                            else
                                reject(err);
                        }
                        else
                            if (stats.isDirectory())
                                resolve(
                                    makeDir(full_path)
                                        .then(() => {
                                            return dir_suffix;
                                        })
                                )
                            else
                                reject(new Error("Path \"" + year_path + "\" exists, but it's not a directory."));
                    });
                }
                else
                    reject(err);
            }
            else
                if (stats.isDirectory())
                    resolve(dir_suffix)
                else
                    reject(new Error("Path \"" + full_path + "\" exists, but it's not a directory."));
        });
    });
};

function getUploadDir(upload_dir) {
    return upload_dir ? path.join(upload_dir, path.sep) : config.get('uploadPath');
}

function importImages(srcDir, dstDir) {
    let files = [];
    let all_files = [];
    return new Promise((resolve, reject) => {
        let uploadDir = getUploadDir(dstDir);
        let impFn = path.join(srcDir, path.sep, "images/import.json");
        let impSettings = JSON.parse(fs.readFileSync(impFn, "utf-8"));
        let res = Promise.resolve();
        if (impSettings.courses) {
            res = makeUploadSubDir(uploadDir)
                .then((dir_suffix) => {
                    return Utils.seqExec(impSettings.courses, (val, key) => {
                        return new Promise((resolve, reject) => {
                            let inFileFn = path.join(srcDir, path.sep, "images", path.sep, val);
                            let outFileFn = path.join(uploadDir, path.sep, dir_suffix, path.sep, val);
                            let inStream = fs.createReadStream(inFileFn);
                            let outStream = fs.createWriteStream(outFileFn);
                            inStream.on("error", (err) => { reject(err); });
                            outStream.on("error", (err) => { reject(err); });
                            outStream.on("close", () => {
                                try {
                                    let mimeType = mime.getType(inFileFn);
                                    resolve(
                                        processImage(val, mimeType, 0, uploadDir, dir_suffix, files, all_files)
                                        .then(() => {
                                            let desc = files[files.length - 1];
                                            desc.url = key;
                                        })
                                    );
                                } catch (e) {
                                    reject(e);
                                }
                            });
                            inStream.pipe(outStream);
                        });
                    });
                });
        }
        resolve(res);
    })
        .then(() => {
            let { CoursesService } = require('./db-course');
            return Utils.seqExec(files, (file) => {
                return CoursesService().update(0, {
                    Cover: file.file,
                    CoverMeta: JSON.stringify(file.info)
                }, { byUrl: file.url });
            });
        });
}

exports.FileUpload = {
    importImages: importImages,
    getFileUploadProc: (upload_dir) => {
        const uploadDir = getUploadDir(upload_dir);
        const fileProcessors = {
            image: processImage,
            audio: processAudio
        };
        return (req, res, next) => {
            let res_files = [];
            let all_files = [];

            const processErr = (err) => {
                let error = err instanceof Error ? err.message : err.toString();
                return Utils.seqExec(all_files, (elem) => {
                    return new Promise((resolve, reject) => {
                        fs.unlink(elem, (err) => {
                            err ? reject(err) : resolve();
                        })
                    });
                })
                    .then(() => {
                        res.status(HTTP_SERVER_ERR).json({ error: error });
                    })
                    .catch((err_io) => {
                        let error2 = err_io instanceof Error ? err_io.message : err_io.toString();
                        res.status(HTTP_SERVER_ERR).json({ error: error, error2: error2 });
                    })
            };

            makeUploadSubDir(uploadDir)
                .then((dir_suffix) => {
 
                    let result = Promise.resolve();
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
                })
                .catch((err) => {
                    return processErr(err);
                });
        }
    }
};
