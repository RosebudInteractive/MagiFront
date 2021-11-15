'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 43]
//
exports.upgradeDb = async (schema) => {

    schema.addModel("ApplicationType", "eab86e08-45d4-4d72-9d34-1dfc5a4cc501", "RootApplicationType", "dce34fc6-0f46-4737-83fa-a4ba7f6a708e")
        .addField("Code", { type: "string", length: 50, allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true })

    schema.addModel("NotificationType", "a3d9819d-3290-44a2-b308-daaa7a71cd22", "RootNotificationType", "164914e6-df65-4688-835e-fb8ee8434141")
        .addField("Code", { type: "string", length: 50, allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true })

    schema.addModel("NotifDeliveryType", "7471c817-857b-4bfd-93a3-46ce8a8279b5", "RootNotifSubscriberType", "ba66421f-ef77-49d8-ab39-c71d51873458")
        .addField("Code", { type: "string", length: 50, allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true })

    schema.addModel("AllowedNotifDelivery", "ce392ec7-05eb-4be3-8546-ae36d56aa652", "RootUserNotifProvider", "f64e9a64-820d-4bf5-bba4-41dc56597d6f")
        .addField("NotifTypeId", { type: "dataRef", model: "NotificationType", refAction: "parentRestrict", allowNull: false })
        .addField("DeliveryTypeId", { type: "dataRef", model: "NotifDeliveryType", refAction: "parentRestrict", allowNull: false })

    schema.addModel("UserDevice", "3240559b-3f21-45b6-95a6-8ad46bbf03fd", "RootUserDevice", "1f10962d-b706-4618-90cd-f3fc928938b3")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("AppTypeId", { type: "dataRef", model: "ApplicationType", refAction: "parentRestrict", allowNull: false })
        .addField("DevId", { type: "string", length: 255, allowNull: false })
        .addField("Token", { type: "string", allowNull: true })

    schema.addModel("NotifEndPoint", "739d2b1a-87d0-4252-beae-922660bd54ba", "RootNotifEndPoint", "ebfb291e-baf1-44f1-a3f8-2587aacdb049")
        .addField("AppTypeId", { type: "dataRef", model: "ApplicationType", refAction: "parentRestrict", allowNull: false })
        .addField("ActiveUserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("DevId", { type: "string", length: 255, allowNull: false })
        .addField("Token", { type: "string", allowNull: true })
        .addField("Status", { type: "int", allowNull: false }) // 1- pending, 2- ok, 3- error
        .addField("ExtData", { type: "json", allowNull: true })

    schema.addModel("EndPointUser", "b6c5e850-d210-4683-a930-2ec789e45869", "RootEndPointUser", "8c418143-94f6-4192-9a63-792d8e687a71")
        .addField("EndPointId", { type: "dataRef", model: "NotifEndPoint", refAction: "parentRestrict", allowNull: false })
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })

    schema.addModel("UserNotification", "1a8fcfd9-9f73-483e-a8cf-1914c8dcba6e", "RootUserNotification", "273c4734-a066-4c4d-a5fd-af0902e1dfe7")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("ItemId", { type: "dataRef", model: "AllowedNotifDelivery", refAction: "parentRestrict", allowNull: false })

    schema.addModel("NotificationTopicType", "3769f19f-3cc7-4d07-91ff-96363165c304", "RootNotificationTopicType", "5d3519b9-6c25-4814-8b90-d1b465a794f5")
        .addField("Code", { type: "string", length: 50, allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true })

    schema.addModel("NotificationTopic", "8c1d4417-6e1e-426e-8970-ebd906de498a", "RootObjNotification", "fb11a386-327d-48da-9069-27cb9aceaf4f")
        .addField("TypeId", { type: "dataRef", model: "NotificationTopicType", refAction: "parentRestrict", allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("ObjId", { type: "int", allowNull: true })
        .addField("Status", { type: "int", allowNull: false }) // 1- pending, 2- ok, 3- error
        .addField("ExtData", { type: "json", allowNull: true })

    schema.addModel("NotifTopicSubscriber", "0ba617f2-4273-46f9-85ba-5d8bdb369311", "RootNotifTopicSubscriber", "3b8ce37c-93bf-4dc2-8dee-6525d8caa87f")
        .addField("TopicId", { type: "dataRef", model: "NotificationTopic", refAction: "parentRestrict", allowNull: false })
        .addField("TypeId", { type: "dataRef", model: "NotifDeliveryType", refAction: "parentRestrict", allowNull: false })
        .addField("ObjId", { type: "int", allowNull: false })
        .addField("Status", { type: "int", allowNull: false }) // 1- pending, 2- ok, 3- error
        .addField("ExtData", { type: "json", allowNull: true })

    schema.addModel("NotificationMessage", "a58642c4-8340-4137-bd0f-85e3bb7d37d5", "RootNotificationMessage", "877dc44c-2d27-437c-b8a4-47e24670a0bc")
        .addField("Type", { type: "int", allowNull: false }) // 1- custom, 2- course, 3- lesson
        .addField("ObjId", { type: "int", allowNull: true })
        .addField("Tag", { type: "string", length: 50, allowNull: true })
        .addField("Body", { type: "json", allowNull: false })
        .addField("ExtData", { type: "json", allowNull: true })

    schema.addModel("NotifMsgRecipient", "e7a20211-a4d4-4ce5-8dd5-35428638dfbd", "RootNotifMsgRecipient", "72665fb2-46d8-4c73-8e0d-4a037c202ec8")
        .addField("MsgId", { type: "dataRef", model: "NotificationMessage", refAction: "parentRestrict", allowNull: false })
        .addField("Type", { type: "int", allowNull: false }) // 1- topic, 2- endpoint
        .addField("Status", { type: "int", allowNull: false }) // 1- pending, 2- ok, 3- error
        .addField("ObjId", { type: "int", allowNull: true })
        .addField("StartedAt", { type: "datetime", allowNull: false })
        .addField("FinishedAt", { type: "datetime", allowNull: true })
        .addField("TrialNum", { type: "int", allowNull: true })
        .addField("TriedAt", { type: "datetime", allowNull: true })
        .addField("ExtData", { type: "json", allowNull: true })
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper({ expr: { model: { name: "ApplicationType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Id: 1,
                    Code: "ios",
                    Name: "Приложение iOS",
                    Description: "Приложение iOS"
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Id: 2,
                    Code: "android",
                    Name: "Приложение Android",
                    Description: "Приложение Android"
                }
            }, {});
        }, {});

    await opts.simpleEditWrapper({ expr: { model: { name: "NotifDeliveryType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Id: 1,
                    Code: "app",
                    Name: "Push в приложениях",
                    Description: "Push уведомления в приложениях."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Id: 2,
                    Code: "email",
                    Name: "Email",
                    Description: "Рассылка по электронной почте."
                }
            }, {})
        }, {});

    await opts.simpleEditWrapper({ expr: { model: { name: "NotificationType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Id: 1,
                    Code: "bookmark",
                    Name: "Курсы в закладках",
                    Description: "Уведомления о новых лекциях курсов в закладках."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Id: 2,
                    Code: "new",
                    Name: "Новые курсы",
                    Description: "Уведомления о новых курсах."
                }
            }, {});
        }, {});

    await opts.simpleEditWrapper({ expr: { model: { name: "AllowedNotifDelivery" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Id: 1,
                    NotifTypeId: 1,
                    DeliveryTypeId: 1
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Id: 2,
                    NotifTypeId: 2,
                    DeliveryTypeId: 1
                }
            }, {});
        }, {});

    await opts.simpleEditWrapper({ expr: { model: { name: "NotificationTopicType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Id: 1,
                    Code: "course",
                    Name: "Курс",
                    Description: "Уведомления о новых лекциях курса."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Id: 2,
                    Code: "newCourse",
                    Name: "Новые курсы",
                    Description: "Уведомления о новых курсах."
                }
            }, {});
        }, {});
};
