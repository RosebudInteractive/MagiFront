'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 45]
//
exports.upgradeDb = async (schema) => {

    schema.addModel("UserInterest", "afaa7238-1677-48b6-aa2e-43360cdeb00b", "RootUserInterest", "d01433f4-ea5b-4728-adaa-9c65521be5ee")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentCascade", allowNull: false })
        .addField("CategoryId", { type: "dataRef", model: "Category", refAction: "parentRestrict", allowNull: false })

};
