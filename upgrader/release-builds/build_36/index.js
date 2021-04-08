'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 36]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Cheque")
        .addField("PaymentType", { type: "int", allowNull: true });
};
