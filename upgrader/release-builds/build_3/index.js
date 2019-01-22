'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 3]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("ProductType")
        .addField("ExtFields", { type: "string", allowNull: true });
}