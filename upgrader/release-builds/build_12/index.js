'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 12]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("CourseLng")
        .addField("VideoIntwLink ", { type: "string", allowNull: true })
        .addField("VideoIntroLink ", { type: "string", allowNull: true });
};
