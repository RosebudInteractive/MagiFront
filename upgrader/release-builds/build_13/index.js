'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 13]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("CourseLng")
        .addField("IntwD", { type: "int", allowNull: true })
        .addField("IntwDFmt", { type: "string", length: 15, allowNull: true })
        .addField("IntroD", { type: "int", allowNull: true })
        .addField("IntroDFmt", { type: "string", length: 15, allowNull: true });
};
