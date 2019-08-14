'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 17]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Test")
        .addField("Status", { type: "int", allowNull: true }); // 1- черновик, 2- опубликован, 3- архив
};
