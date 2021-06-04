'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 38]
//

exports.upgradeDb = async (schema) => {
    schema.addModel("Notification", "8a15a171-2550-49dc-93e0-4894d775fad8", "RootNotification", "8963d6ac-9e12-4a93-9d47-43f2f2e55923")
        // поле NotifType
        // 1- можно приступать к задаче
        // 2 - переход задачи из "Вопрос" в "В процессе"
        // 3 - переход задачи в состояние "Вопрос"
        .addField("NotifType", { type: "int", allowNull: false })
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("NotifKey", { type: "string", length: 50, allowNull: false })
        .addField("Subject", { type: "string", allowNull: false })
        .addField("URL", { type: "string", allowNull: true })
        .addField("Data", { type: "string", allowNull: true })
        .addField("IsRead", { type: "boolean", allowNull: false })
        .addField("IsUrgent", { type: "boolean", allowNull: false })
        .addField("IsSent", { type: "boolean", allowNull: false })
};
