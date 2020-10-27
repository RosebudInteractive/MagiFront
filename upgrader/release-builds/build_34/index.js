'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 34]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Question")
        .addField("Complexity", { type: "int", allowNull: true });
};
