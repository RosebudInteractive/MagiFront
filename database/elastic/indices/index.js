'use strict';
const _ = require('lodash');
const { IdxLesson, IdxLessonService } = require('./idx-lesson');
const { IdxAuthor, IdxAuthorService } = require('./idx-author');
const { IdxCourse, IdxCourseService } = require('./idx-course');

function removeDuplicates(arr_fld) {
    let result = [];
    let lst = {};
    arr_fld.forEach(elem => {
        if (!lst[elem]) {
            lst[elem] = true;
            result.push(elem);
        }
    });
    return result;
}

function arrayToHash(arr_fld) {
    let result = {};
    arr_fld.forEach(elem => {
        result[elem] = true;
    });
    return result;
}

module.exports = {

    processHits: async (hits, baseUrl) => {
        let result = [];
        if (hits) {
            let types = {};
            types[IdxLessonService().indexName] = { type: "lesson", proc: IdxLessonService().processHit.bind(IdxLessonService()) };
            types[IdxAuthorService().indexName] = { type: "author", proc: IdxAuthorService().processHit.bind(IdxAuthorService()) };
            types[IdxCourseService().indexName] = { type: "course", proc: IdxCourseService().processHit.bind(IdxCourseService()) };
            for (let i = 0; i < hits.length; i++) {
                let processHit = types[hits[i]["_index"]];
                if (processHit) {
                    let res = await processHit.proc(hits[i], baseUrl);
                    res.type = processHit.type;
                    result.push(res);
                }
                else
                    throw new Error(`indices::processHits: Unknown index: ${hits[i]["_index"]}.`);

            }
        }
        return result;
    },

    getSearchFields: (idx_list) => {
        let list = idx_list || {};
        let result = { index: [], analyzer: [], source: [], highlight: [], sort: {} };
        let sort = [];
        if (list.lesson) {
            result.index.push(IdxLessonService().indexName);
            result.analyzer = result.analyzer.concat(IdxLesson.analyzerFields);
            result.source = result.source.concat(IdxLesson.dataFields);
            result.highlight = result.highlight.concat(IdxLesson.highlightFields);
            sort = sort.concat(IdxLesson.sortFields);
        }
        if (list.author) {
            result.index.push(IdxAuthorService().indexName);
            result.analyzer = result.analyzer.concat(IdxAuthor.analyzerFields);
            result.source = result.source.concat(IdxAuthor.dataFields);
            result.highlight = result.highlight.concat(IdxAuthor.highlightFields);
            sort = sort.concat(IdxAuthor.sortFields);
        }
        if (list.course) {
            result.index.push(IdxCourseService().indexName);
            result.analyzer = result.analyzer.concat(IdxCourse.analyzerFields);
            result.source = result.source.concat(IdxCourse.dataFields);
            result.highlight = result.highlight.concat(IdxCourse.highlightFields);
            sort = sort.concat(IdxCourse.sortFields);
        }
        result.source = removeDuplicates(result.source);
        result.sort = arrayToHash(sort);
        return result;
    },

    importProc: async (conn, options) => {
        let opts = options || {};
        let result = {};
        if (opts.lesson)
            result.lesson = await IdxLessonService().importData(conn, opts.lesson);
        if (opts.author)
            result.author = await IdxAuthorService().importData(conn, opts.author);
        if (opts.course)
            result.course = await IdxCourseService().importData(conn, opts.course);
        return result;
    }
}