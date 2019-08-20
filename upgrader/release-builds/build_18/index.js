'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 18]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Episode")
        .addField("ContentType", { type: "int", allowNull: true }); // 1- аудио, 2- видео
    schema.getModel("EpisodeLng")
        .addField("VideoLink", { type: "string", allowNull: true });
};
