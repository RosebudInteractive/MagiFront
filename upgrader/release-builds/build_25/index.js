'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 25]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Cheque")
        .addField("PromoCode", { type: "string", length: 50, allowNull: true });
};
