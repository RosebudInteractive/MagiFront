'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 26]
//
exports.upgradeDb = async (schema) => {

    schema.getModel("Test")
        .addField("IsAuthRequired", { type: "boolean", allowNull: true });
    
    schema.addModel("TestInstanceShared", "f997695c-260e-4712-91d2-2530e00e3088", "RootTestInstanceShared", "533368ee-19c0-4ede-b553-f9ef41dc851d")
        .addField("TestId", { type: "dataRef", model: "Test", refAction: "parentRestrict", allowNull: false })
        .addField("TestInstanceId", { type: "dataRef", model: "TestInstance", refAction: "parentRestrict", allowNull: true })
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: true })
        .addField("Code", { type: "string", length: 25, allowNull: false })
        .addField("SnName", { type: "string", allowNull: true })
        .addField("SnDescription", { type: "string", allowNull: true });

    schema.addModel("TestInstanceShMetaImage", "8a2362ec-428a-4242-94c9-58813a3b1716", "RootTestInstanceMetaImage", "2cc84599-ddc2-4bd5-a2fb-25ac635d5ef7")
        .addField("TestInstanceSharedId", { type: "dataRef", model: "TestInstanceShared", refAction: "parentCascade", allowNull: false })
        .addField("Type", { type: "string", length: 50, allowNull: false })
        .addField("FileName", { type: "string", length: 255, allowNull: false })
        .addField("MetaData", { type: "string", allowNull: true });
};
