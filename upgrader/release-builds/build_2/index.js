'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 2]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("CourseLng")
        .addField("ExtLinks", { type: "string", allowNull: true });

    schema.getModel("LessonLng")
        .addField("ExtLinks", { type: "string", allowNull: true });
}