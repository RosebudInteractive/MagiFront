'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 20]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Cheque")
        .addField("SendStatusChangedAt", { type: "datetime", allowNull: true });
};
