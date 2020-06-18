'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 32]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("MrktSysLog", "c4c1c7d3-ff5d-4042-b100-1868318ca3e9", "RootMrktSysLog", "0d3e3096-89d1-4a92-b7dd-e9bd190ce841")
        .addField("SysCode", { type: "string", length: 50, allowNull: false })
        .addField("OpType", { type: "string", length: 50, allowNull: false })
        .addField("SubType", { type: "string", length: 50, allowNull: true })
        .addField("OpDate", { type: "datetime", allowNull: false })
        .addField("OpId", { type: "int", allowNull: true })
        .addField("HttpStatus", { type: "int", allowNull: true })
        .addField("Succeeded", { type: "boolean", allowNull: false })
        .addField("Trial", { type: "int", allowNull: false })
        .addField("Order", { type: "int", allowNull: false })
        .addField("Request", { type: "string", allowNull: false })
        .addField("Response", { type: "string", allowNull: true });
};
