'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 21]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Cheque")
        .addField("LastTrialTs", { type: "datetime", allowNull: true })
        .addField("TrialNum", { type: "int", allowNull: true })
        .addField("ReceiptDate", { type: "datetime", allowNull: true })
        .addField("ReceiptData", { type: "string", allowNull: true });
};
