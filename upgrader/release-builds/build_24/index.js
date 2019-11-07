'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 24]
//
exports.upgradeDb = async (schema) => {

    schema.addModel("TestMetaImage", "f2705233-624b-4b91-b80f-75446225c493", "RootTestMetaImage", "e704a329-91b1-47f5-a7d9-c61caa633335")
        .addField("TestId", { type: "dataRef", model: "Test", refAction: "parentCascade", allowNull: false })
        .addField("Type", { type: "string", length: 50, allowNull: false })
        .addField("FileName", { type: "string", length: 255, allowNull: false })
        .addField("MetaData", { type: "string", allowNull: true });

    schema.getModel("Test")
        .addField("Cover", { type: "string", length: 255, allowNull: true })
        .addField("CoverMeta", { type: "string", allowNull: true })
        .addField("URL", { type: "string", length: 255, allowNull: true })
        .addField("SnPost", { type: "string", allowNull: true })
        .addField("SnName", { type: "string", allowNull: true })
        .addField("SnDescription", { type: "string", allowNull: true });
};
