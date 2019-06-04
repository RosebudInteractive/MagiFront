'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 11]
//
exports.upgradeDb = async (schema) => {

    schema.addModel("CourseMetaImage", "5ae1fbac-5956-4f49-a052-4080de211316", "RootCourseMetaImage", "8a6571fd-267b-4f39-b7b3-067d761bc2cd")
        .addField("CourseLngId", { type: "dataRef", model: "CourseLng", refAction: "parentCascade", allowNull: false })
        .addField("Type", { type: "string", length: 50, allowNull: false })
        .addField("FileName", { type: "string", length: 255, allowNull: false })
        .addField("MetaData", { type: "string", allowNull: true });

    schema.getModel("CourseLng")
        .addField("SnPost", { type: "string", allowNull: true })
        .addField("SnName", { type: "string", allowNull: true })
        .addField("SnDescription", { type: "string", allowNull: true });
};
