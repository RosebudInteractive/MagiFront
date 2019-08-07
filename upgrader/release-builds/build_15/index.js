'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 15]
//
exports.upgradeDb = async (schema) => {

    schema.addModel("TestType", "78e9b7d6-2baa-4723-82a8-555960b4a8ab", "RootTestType", "9c582f5a-ae03-4d45-999f-3de51412f522")
        .addField("Code", { type: "string", length: 50, allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true });

    schema.addModel("Test", "ced3243d-35b5-40af-ba60-f792f0018102", "RootTest", "8f3087ab-b0a2-49d8-b769-2603de7ac781")
        .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
        .addField("TestTypeId", { type: "dataRef", model: "TestType", refAction: "parentRestrict", allowNull: false })
        .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: true })
        .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: true })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Method", { type: "int", allowNull: false }) // принцип тестирования: 1- послед., 2-  произв.
        .addField("MaxQ", { type: "int", allowNull: true })
        .addField("FromLesson", { type: "boolean", allowNull: true })
        .addField("Duration", { type: "int", allowNull: true });

    schema.addModel("Question", "83c5bb31-14b5-4ce0-9975-eb9f4d81e012", "RootQuestion", "a002a804-b3ad-4add-9203-3a10cd78795d")
        .addField("TestId", { type: "dataRef", model: "Test", refAction: "parentCascade", allowNull: false })
        .addField("Number", { type: "int", allowNull: false })
        .addField("AnswTime", { type: "int", allowNull: true })
        .addField("Text", { type: "string", allowNull: false })
        .addField("Picture", { type: "string", length: 255, allowNull: true })
        .addField("PictureMeta", { type: "string", allowNull: true })
        .addField("AnswType", { type: "int", allowNull: false }) // 1- число, 2-да/нет, 3-1 из многих, 4-N из многих, 5-текст
        .addField("Score", { type: "int", allowNull: true })
        .addField("StTime", { type: "int", allowNull: true })
        .addField("EndTime", { type: "int", allowNull: true })
        .addField("AllowedInCourse", { type: "boolean", allowNull: true })
        .addField("AnswBool", { type: "boolean", allowNull: true })
        .addField("AnswInt", { type: "int", allowNull: true })
        .addField("AnswText", { type: "string", allowNull: true })
        .addField("CorrectAnswResp", { type: "string", allowNull: true })
        .addField("WrongAnswResp", { type: "string", allowNull: true });
    
    schema.addModel("Answer", "97ae02f0-dc7e-418e-ade9-47417863e536", "RootAnswer", "0d2b9e70-1944-40f7-99f2-812be52cc29b")
        .addField("QuestionId", { type: "dataRef", model: "Question", refAction: "parentCascade", allowNull: false })
        .addField("Number", { type: "int", allowNull: false })
        .addField("Text", { type: "string", allowNull: false })
        .addField("IsCorrect", { type: "boolean", allowNull: false });

    schema.addModel("TestInstance", "0380cfee-8d22-41d8-8a32-24e298a011f4", "RootTestInstance", "0f4e815d-62cf-49c9-8f11-26b95ddf5847")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("TestId", { type: "dataRef", model: "Test", refAction: "parentRestrict", allowNull: false })
        .addField("StTime", { type: "datetime", allowNull: true })
        .addField("ActDuration", { type: "int", allowNull: true })
        .addField("Duration", { type: "int", allowNull: true })
        .addField("Score", { type: "int", allowNull: true })
        .addField("MaxScore", { type: "int", allowNull: true })
        .addField("IsFinished", { type: "boolean", allowNull: false })
        .addField("IsVisible", { type: "boolean", allowNull: false });

    schema.addModel("InstanceQuestion", "7307131a-e444-4b66-9053-0bc9b2257b0c", "RootInstanceQuestion", "3472f6d4-d424-455a-83ba-70d727a76b97")
        .addField("TestInstanceId", { type: "dataRef", model: "TestInstance", refAction: "parentCascade", allowNull: false })
        .addField("QuestionId", { type: "dataRef", model: "Question", refAction: "parentRestrict", allowNull: false })
        .addField("Number", { type: "int", allowNull: false })
        .addField("Answer", { type: "string", allowNull: true })
        .addField("AnswTime", { type: "int", allowNull: true })
        .addField("Score", { type: "int", allowNull: true });
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper({ expr: { model: { name: "TestType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Code: "GENERAL",
                    Name: "Общее тестирование знаний",
                    Description: "Общее тестирование знаний."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Code: "BEFORE",
                    Name: "Тест перед изучением материала",
                    Description: "Предварительная проверка знания предмета изучения."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Code: "AFTER",
                    Name: "Тест на усвоение материала",
                    Description: "Тест на усвоение материала."
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Code: "ADDITIONAL",
                    Name: "Дополнительный тест",
                    Description: "Дополнительный тест."
                }
            }, {});
        }, {});
};
