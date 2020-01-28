'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 28]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("ChequeStatLog", "3b71e1d6-f6ba-4a82-a303-8e9561707c4a", "RootChequeStatLog", "61406584-1b8f-4002-9d2d-0aa5701f6fdd")
        .addField("ChequeId", { type: "dataRef", model: "Cheque", refAction: "parentCascade", allowNull: false })
        .addField("RecType", { type: "int", allowNull: false }) // 1- request, 2- response 
        .addField("Data", { type: "string", allowNull: false });
};
