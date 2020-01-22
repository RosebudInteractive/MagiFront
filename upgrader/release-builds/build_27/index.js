'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 27]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("TestShareCounter", "426afb90-eedf-4478-8e25-f95e89d35553", "RootTestShareCounter", "41d1b47c-6bfb-4bc3-b78f-dd314cae4914")
        .addField("TestId", { type: "dataRef", model: "Test", refAction: "parentCascade", allowNull: false })
        .addField("SNetProviderId", { type: "dataRef", model: "SNetProvider", refAction: "parentRestrict", allowNull: false })
        .addField("Counter", { type: "int", allowNull: false });
};
