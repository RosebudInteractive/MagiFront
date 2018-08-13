'use strict';
const path = require('path');
const { ImportEpisode } = require('./import-episode');

let importEpisode = null;

exports.ImportEpisodeParams = () => {
    return ["idLesson", "idEpisode"];
};

exports.ImportEpisode = () => (uploadDir, file, options) => {
    if (!importEpisode)
        importEpisode = new ImportEpisode();
    return importEpisode.importEpisode(path.join(uploadDir, file[0].file), options);
};
