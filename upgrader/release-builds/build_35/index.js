'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 35]
//

const { ACCOUNT_ID } = require('../../../const/sql-req-common');

exports.upgradeDb = async (schema) => {
    schema.addModel("PmProcessStruct", "b7c654c5-7d79-4f57-8923-5b532bcc0961", "RootPmProcessStruct", "4151967c-97a8-463d-956c-eb1c66c8fa5f")
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Script", { type: "string", allowNull: true })
        .addField("ProcessFields", { type: "string", allowNull: false })

    schema.addModel("PmElement", "a169492f-1d2e-48c7-9671-71b007f4cac8", "RootPmElement", "ff4a96cc-3ba2-42e2-8c1f-a4d5049839df")
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Index", { type: "int", allowNull: false })
        .addField("StructId", { type: "dataRef", model: "PmProcessStruct", refAction: "parentRestrict", allowNull: false })
        .addField("WriteFields", { type: "string", allowNull: true })
        .addField("ViewFields", { type: "string", allowNull: true })

    schema.addModel("PmProcess", "ff68cb0b-0e15-48a7-82ce-f31aaed30e3d", "RootPmProcess", "4ffe29d7-476c-4562-b72e-9581a6c19ec1")
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("State", { type: "int", allowNull: false }) // 1- Draft, 2- Executing, 3- Finished 
        .addField("StructId", { type: "dataRef", model: "PmProcessStruct", refAction: "parentRestrict", allowNull: false })
        .addField("SupervisorId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: true })
        .addField("DueDate", { type: "datetime", allowNull: true })

    schema.getModel("PmProcess")
        .inherit("PmLsnProcess", "8f2b85ef-39a3-4942-852b-ec814d544945", "RootLsnProcess", "a10b93a7-9bf4-4425-821d-d07aff282bc3")
        .addField("AudioIniURL", { type: "string", allowNull: true })
        .addField("AudioIniComment", { type: "string", allowNull: true })
        .addField("InstrToAudioEdt", { type: "string", allowNull: true })
        .addField("AudioProcURL", { type: "string", allowNull: true })
        .addField("TranscriptURL", { type: "string", allowNull: true })
        .addField("PicDescriptionURL", { type: "string", allowNull: true })
        .addField("PicSrcURL", { type: "string", allowNull: true })
        .addField("PicAuthorURL", { type: "string", allowNull: true })
        .addField("PicFinalURL", { type: "string", allowNull: true })
        .addField("TechTransTiterURL", { type: "string", allowNull: true })
        .addField("TechTransEditURL", { type: "string", allowNull: true })
        .addField("RefsURL", { type: "string", allowNull: true })
        .addField("AudioFinalURL", { type: "string", allowNull: true })
        .addField("AudioNotes", { type: "string", allowNull: true })
        .addField("TechTransTimeURL", { type: "string", allowNull: true })
        .addField("TechTransMusicURL", { type: "string", allowNull: true })
        .addField("AllCompsFinalURL", { type: "string", allowNull: true })

    schema.addModel("PmElemProcess", "d0ada52c-0407-4079-ada5-8d40c370f677", "RootElemProcess", "ace78880-897e-4dc1-854d-e8d13ab19ea9")
        .addField("State", { type: "int", allowNull: false }) // 1- Not Ready, 2- In Progress, 3- Ready 
        .addField("Index", { type: "int", allowNull: false })
        .addField("ProcessId", { type: "dataRef", model: "PmProcess", refAction: "parentRestrict", allowNull: false })
        .addField("ElemId", { type: "dataRef", model: "PmElement", refAction: "parentRestrict", allowNull: false })
        .addField("TaskId", { type: "dataRef", model: "PmTask", refAction: "parentRestrict", allowNull: true })
        .addField("SupervisorId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: true })

    schema.addModel("PmTask", "f1e77a9e-f4c3-406f-a85d-5b6a2a6c378f", "RootPmTask", "4ed39abd-900b-4bb0-a66f-d4cd1e6fbe54")
        .addField("ProcessId", { type: "dataRef", model: "PmProcess", refAction: "parentRestrict", allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("State", { type: "int", allowNull: false }) // 1- В ожидании, 2- Можно приступать, 3- В процессе,
                                                              // 4 - эскалация супервизору, 5- Завершена
        .addField("DueDate", { type: "datetime", allowNull: true })
        .addField("ExecutorId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: true })
        .addField("Description", { type: "string", allowNull: true })
        .addField("AlertId", { type: "dataRef", model: "PmTaskLog", refAction: "parentRestrict", allowNull: true })
        .addField("ElementId", { type: "dataRef", model: "PmElemProcess", refAction: "parentRestrict", allowNull: true })
        .addField("IsElemReady", { type: "boolean", allowNull: false })
        .addField("WriteFieldSet", { type: "string", allowNull: true })

    schema.addModel("PmTaskLog", "63d76ccd-b7e0-494b-8689-38c3327d6c59", "RootPmTaskLog", "2e15f237-b6f7-4b6d-886b-6e6c693bb820")
        .addField("Text", { type: "string", allowNull: false })
        .addField("TaskId", { type: "dataRef", model: "PmTask", refAction: "parentRestrict", allowNull: false })
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })

    schema.addModel("PmDepTask", "c4597f5a-0a83-4d34-bd12-235b858850c8", "RootPmDepTask", "fb9adbca-0856-47d7-a1aa-e0bc4e915afa")
        .addField("DepTaskId", { type: "dataRef", model: "PmTask", refAction: "parentRestrict", allowNull: false })
        .addField("TaskId", { type: "dataRef", model: "PmTask", refAction: "parentRestrict", allowNull: false })
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};
    let admin_data;

    await opts.simpleEditWrapper({ expr: { model: { name: "Role" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            admin_data = await root_obj.newObject({
                fields: {
                    Code: "PMADM",
                    ShortCode: "pma",
                    Name: "Администратор процессов",
                    Description: "Администрирование всех процессов в системе."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Code: "PMSV",
                    ShortCode: "pms",
                    Name: "Супервизор процесса",
                    Description: "Создание и администрирование своих процессов."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Code: "PMEL",
                    ShortCode: "pme",
                    Name: "Ответственный за элемент процесса",
                    Description: "Управление элементами процесса."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Code: "PMUS",
                    ShortCode: "pmu",
                    Name: "Исполнитель задач",
                    Description: "Выполнение задач внутри процесса."
                }
            }, {});
        }, {});

    const USER_USERROLE_EXPRESSION = {
        expr: {
            model: {
                name: "User",
                childs: [
                    {
                        dataObject: {
                            name: "UserRole"
                        }
                    }
                ]
            }
        }
    };

    await opts.simpleEditWrapper(USER_USERROLE_EXPRESSION, {
        field: "Email",
        op: "in",
        value: ["staloverov@rosebud.ru", "sokolov@rosebud.ru", "ivan.collector@gmail.com", "andrey@magisteria.ru"]
    },
        async (root_obj) => {
            let collection = root_obj.getCol("DataElements");
            for (let i = 0; i < collection.count(); i++) {
                let user = collection.get(i);
                let pData = JSON.parse(user.pData());
                if (!pData.roles)
                    pData.roles = {};
                pData.roles["pma"] = 1;
                user.pData(JSON.stringify(pData));
                let root_role = user.getDataRoot("UserRole");
                await root_role.newObject({ fields: { AccountId: ACCOUNT_ID, RoleId: admin_data.keyValue } }, {});
            }
        }, {});
};
