'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 30]
//
exports.upgradeDb = async (schema) => {

    schema.getModel("User")
        .addField("RegProviderId", { type: "dataRef", model: "SNetProvider", refAction: "parentRestrict", allowNull: true });

    schema.getModel("Test")
        .addField("Description", { type: "string", allowNull: true });

    schema.getModel("Question")
        .addField("Comment", { type: "string", allowNull: true });
};
