'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 16]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Test")
        .addField("IsTimeLimited", { type: "boolean", allowNull: true });
};
