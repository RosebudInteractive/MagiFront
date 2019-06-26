'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 14]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Cheque")
        .addField("SendStatus", { type: "int", allowNull: true });
};
