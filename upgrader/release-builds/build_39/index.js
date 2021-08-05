'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 39]
//

const { ACCOUNT_ID, LANGUAGE_ID } = require('../../../const/sql-req-common');

exports.upgradeDb = async (schema) => {
    schema.getModel("Entity")
        .inherit("Event", "c1ec1b2f-d485-40ca-a8f7-0c4dd46d0f4f", "RootEvent", "00307c80-7d9e-4809-b464-6a0520136954")
        .addField("Day", { type: "int", allowNull: true })
        .addField("Month", { type: "int", allowNull: true })
        .addField("Year", { type: "int", allowNull: true })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("ShortName", { type: "string", length: 255, allowNull: true })
        .addField("Description", { type: "string", allowNull: true })
        .addField("State", { type: "int", allowNull: false }) // 1- draft, 2- published
        .addField("TlCreationId", { type: "dataRef", model: "Timeline", refAction: "parentRestrict", allowNull: true })
        .addField("TlPublicId", { type: "dataRef", model: "Timeline", refAction: "parentRestrict", allowNull: true })

    schema.addModel("Period", "35361382-68f6-478f-bd47-6b0d9c1762f9", "RootPeriod", "e358f33f-0968-4606-b5c4-7f83fa47d5b6")
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("ShortName", { type: "string", length: 255, allowNull: true })
        .addField("Description", { type: "string", allowNull: true })
        .addField("LbId", { type: "dataRef", model: "Event", refAction: "parentRestrict", allowNull: true })
        .addField("LbDay", { type: "int", allowNull: true })
        .addField("LbMonth", { type: "int", allowNull: true })
        .addField("LbYear", { type: "int", allowNull: true })
        .addField("RbId", { type: "dataRef", model: "Event", refAction: "parentRestrict", allowNull: true })
        .addField("RbDay", { type: "int", allowNull: true })
        .addField("RbMonth", { type: "int", allowNull: true })
        .addField("RbYear", { type: "int", allowNull: true })
        .addField("State", { type: "int", allowNull: false }) // 1- draft, 2- published
        .addField("TlCreationId", { type: "dataRef", model: "Timeline", refAction: "parentRestrict", allowNull: true })
        .addField("TlPublicId", { type: "dataRef", model: "Timeline", refAction: "parentRestrict", allowNull: true })

    schema.addModel("Timeline", "41ebb9ea-8bee-47eb-98b8-b12b4708fa22", "RootTimeline", "691daedb-e820-4d45-8a17-4d44eece334c")
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true })
        .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: true })
        .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: true })
        .addField("SpecifCode", { type: "string", length: 100, allowNull: true })
        .addField("Order", { type: "int", allowNull: true })
        .addField("Image", { type: "string", length: 255, allowNull: true })
        .addField("ImageMeta", { type: "string", allowNull: true })
        .addField("Options", { type: "string", allowNull: true })
        .addField("State", { type: "int", allowNull: false }) // 1- draft, 2- published
        .addField("ProcessId", { type: "dataRef", model: "PmProcess", refAction: "parentRestrict", allowNull: true })

    schema.addModel("TimelineEvent", "4788731b-a7ce-4545-94a6-42cab988ce5b", "RootTimelineEvent", "f91ab248-caa1-4bac-9d49-6082afa2f282")
        .addField("TimelineId", { type: "dataRef", model: "Timeline", refAction: "parentRestrict", allowNull: false })
        .addField("EventId", { type: "dataRef", model: "Event", refAction: "parentRestrict", allowNull: false })

    schema.addModel("TimelinePeriod", "cc99be21-2e8d-431e-b983-d06a7b65f3b7", "RootTimelinePeriod", "6e0d7e06-9a58-4fd5-92fd-89d639a4f3ab")
        .addField("TimelineId", { type: "dataRef", model: "Timeline", refAction: "parentRestrict", allowNull: false })
        .addField("PeriodId", { type: "dataRef", model: "Period", refAction: "parentRestrict", allowNull: false })

    schema.addModel("Command", "c7d86eb1-2b1b-4bd5-b7c0-487382057ab8", "RootCommand", "4ad59800-dda7-41a0-859e-ab9a9cc14358")
        .addField("TimelineId", { type: "dataRef", model: "Timeline", refAction: "parentRestrict", allowNull: false })
        .addField("Number", { type: "int", allowNull: false })
        .addField("TimeCode", { type: "int", allowNull: true })
        .addField("Code", { type: "string", length: 255, allowNull: false })
        .addField("Args", { type: "string", allowNull: true })

    schema.addModel("CommandEvent", "3ac1761e-004b-4b18-88e4-ba52debca974", "RootCommandEvent", "e921d545-e970-4025-90ba-cd691e6343d8")
        .addField("CommandId", { type: "dataRef", model: "Command", refAction: "parentRestrict", allowNull: false })
        .addField("Number", { type: "int", allowNull: false })
        .addField("EventId", { type: "dataRef", model: "Event", refAction: "parentRestrict", allowNull: true })
        .addField("PeriodId", { type: "dataRef", model: "Period", refAction: "parentRestrict", allowNull: true })
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper(
        {
            expr: {
                model: {
                    name: "EntityType", childs: [
                        {
                            dataObject: {
                                name: "EntityTypeLng"
                            }
                        }
                    ]
                }
            }
        }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            let res = await root_obj.newObject({ fields: { Code: "EVENT" } }, {});
            let entity_type = opts.db.getObj(res.newObject);
            let root_lng = entity_type.getDataRoot("EntityTypeLng");
            await root_lng.newObject({
                fields: {
                    LanguageId: LANGUAGE_ID,
                    Name: "Событие"
                }
            }, {});
        }, {});
};
