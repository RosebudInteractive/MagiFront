'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 4]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("LsnHistory", "4598de3c-7ee3-49aa-b367-7ad078a16d53", "RootLsnHistory", "e55d55d0-6e1f-421b-8430-1c339ce8fd11")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
        .addField("StDate", { type: "datetime", allowNull: false })
        .addField("FinDate", { type: "datetime", allowNull: false })
        .addField("LsnTime", { type: "float", allowNull: false })
        .addField("UserTime", { type: "float", allowNull: false })
        .addField("RawData", { type: "string", allowNull: false });
}