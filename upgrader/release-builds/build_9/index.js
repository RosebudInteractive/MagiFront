'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 9]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Cheque")
        .addField("CampaignId", { type: "dataRef", model: "Campaign", refAction: "parentRestrict", allowNull: true });
};
