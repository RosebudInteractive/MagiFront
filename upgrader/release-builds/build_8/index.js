'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 8]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("Campaign", "4255e7c4-25df-48fb-b2fd-3fadbab31a5d", "RootCampaign", "bd4e6e2d-e59c-4ee2-a1f9-7b9b5cc3286b")
        .addField("Source", { type: "string", length: 255, allowNull: false })
        .addField("Medium", { type: "string", length: 255, allowNull: false })
        .addField("Campaign", { type: "string", length: 255, allowNull: false });

    schema.getModel("User")
        .addField("CampaignId", { type: "dataRef", model: "Campaign", refAction: "parentRestrict", allowNull: true });

    schema.getModel("LsnHistory")
        .addField("CampaignId", { type: "dataRef", model: "Campaign", refAction: "parentRestrict", allowNull: true });
};
