'use strict';
const path = require('path');
const { ImportEpisode } = require('./import-episode');
const { ImportTest } = require('./import-test');

let importEpisode = null;

exports.ImportEpisodeParams = () => {
    return ["idLesson", "idEpisode"];
};

exports.ImportEpisode = () => (uploadDir, file, options) => {
    if (!importEpisode)
        importEpisode = new ImportEpisode();
    return importEpisode.import(path.join(uploadDir, file[0].file), options);
};

let importTest = null;

exports.ImportTestParams = () => {
    return ["idTest", "deleteInstances"];
};

exports.ImportTest = () => (uploadDir, file, options) => {
    if (!importTest)
        importTest = new ImportTest();
    return importTest.import(path.join(uploadDir, file[0].file), options);
};
