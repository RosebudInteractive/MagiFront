'use strict';
const _ = require('lodash');
const { ImportLessonService } = require('./import-lesson');
const { ImportAuthorService } = require('./import-author');
const { ImportCourseService } = require('./import-course');

exports.importProc = async (conn, options) => {
    let opts = options || {};
    let result = {};
    if (opts.lesson)
        result.lesson = await ImportLessonService().importData(conn, opts.lesson);
    if (opts.author)
        result.author = await ImportAuthorService().importData(conn, opts.author);
    if (opts.course)
        result.course = await ImportCourseService().importData(conn, opts.course);
    return result;
}