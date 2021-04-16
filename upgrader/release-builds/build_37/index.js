'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 37]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("PmProcess")
        .addField("TechTransMusicResultURL", { type: "string", allowNull: true });
    schema.getModel("PmElement")
        .addField("SupervisorId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: true });
};
