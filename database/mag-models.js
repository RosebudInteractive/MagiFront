exports.getSchemaGenFunc = function (uccelloDir) {
    return function (metaDataMgr) {
        const coreModels = require(uccelloDir + '/dataman/core-models');
        const Meta = require(uccelloDir + '/metadata/meta-defs');
        coreModels(metaDataMgr);

        metaDataMgr.addModel("Language", "fd4b9b70-514e-4796-9a27-eb0adf8e7944", "RootLanguage", "36ce5c73-0976-4b9e-bbeb-caaefd13bad0")
            .addField("Code", { type: "string", length: 3, allowNull: false })
            .addField("Language", { type: "string", length: 50, allowNull: false });
        
        metaDataMgr.addModel("Role", "e788831c-6f91-4bf6-ae6f-a21f0243d670", "RootRole", "b23a3900-6f89-4df4-b4e4-ca6d475b3d60")
            .addField("Name", { type: "string", length: 50, allowNull: false });

        metaDataMgr.addModel("Account", "81b276ee-a34a-4267-9f24-0fce75896c91", "RootAccount", "3a19b68f-50fe-4fa9-923e-0f14d6272a72")
            .addField("Domain", { type: "string", length: 50, allowNull: false })
            .addField("DefLangId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: true });

        metaDataMgr.addModel("AccountLng", "a3d4d86b-aa83-4a31-b655-88a8a846e36d", "RootAccountLng", "a0399798-fb12-4080-bb8e-82cc4bc0bb2d")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Name", { type: "string", length: 100, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.getModel("SysUser")
            .inherit("User", "ad96cb5d-a5a7-4fae-b8b7-738ca992fcd4", "RootUser", "5ef58b64-044e-42e4-b43c-3f8c455bb139")
            .addField("OwnedAccount", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: true })
            .addField("Name", { type: "string", length: 50, allowNull: true })
            .addField("Mail", { type: "string", length: 50, allowNull: true })
            .addField("Phone", { type: "string", length: 50, allowNull: true })
            .addField("SNetWorkType", { type: "string", length: 10, allowNull: true })
            .addField("SNetWorkId", { type: "string", length: 50, allowNull: true })
            .addField("SubsBegin", { type: "datetime", allowNull: true })
            .addField("SubsEnd", { type: "datetime", allowNull: true })
            .addField("Params", { type: "string", allowNull: true });

        metaDataMgr.addModel("UserRole", "86e022dd-13d9-4c9d-811c-76b2ac807cff", "RootUserRole", "87c43f07-15f7-47d3-9309-263c14d71959")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
            .addField("RoleId", { type: "dataRef", model: "Role", refAction: "parentRestrict", allowNull: false });

        metaDataMgr.addModel("Transaction", "d0b37074-3748-495b-8d96-20f1c55d27a8", "RootTransaction", "f5d989fb-da06-405a-9395-6cc3cd7d0082")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false })
            .addField("TimeStamp", { type: "datetime", allowNull: false })
            .addField("Amount", { type: "decimal", precision: 12, scale: 4, allowNull: false });

        metaDataMgr.addModel("OwnedCourses", "bb17bb48-613a-4fa3-b3ed-11205cf7fd08", "RootOwnedCourses", "bf1a08d6-e535-4920-87b2-9733c6369562")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false })
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: true })
            .addField("TransactionId", { type: "dataRef", model: "Transaction", refAction: "parentRestrict", allowNull: true })
            .addField("Position", { type: "int", allowNull: true });

        metaDataMgr.addModel("Author", "47b13680-c656-4ba4-82e6-3bd14badfcef", "RootAuthor", "065a0fce-be87-45db-8aa6-0581e7846c83")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: false })
            .addField("Portrait", { type: "string", length: 200, allowNull: true });

        metaDataMgr.addModel("AuthorLng", "2efeead7-684d-46fa-b11b-555ffb2da5a6", "RootAuthorLng", "e306cc09-7c70-4dda-b428-a361eae7e1a2")
            .addField("AuthorId", { type: "dataRef", model: "Author", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("FirstName", { type: "string", length: 100, allowNull: false })
            .addField("LastName", { type: "string", length: 100, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("AuthorToCourse", "2f0ce749-4169-4ec0-9a87-0ffd405a4337", "RootAuthorToCourse", "feebc518-1fa6-4051-b39e-7958ed30feb7")
            .addField("AuthorId", { type: "dataRef", model: "Author", refAction: "parentRestrict", allowNull: false })
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false });

        metaDataMgr.addModel("Course", "5995f1c7-43dc-4367-8071-532702b94235", "RootCourse", "f3500436-4b99-48a7-a60b-8b6d6e1a9ac8")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "P", "A"], allowNull: false })
            .addField("Cover", { type: "string", length: 200, allowNull: true })
            .addField("Color", { type: "int", allowNull: true })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: true })
            .addField("OneLesson", { type: "boolean", allowNull: true })
            .addField("URL", { type: "string", length: 200, allowNull: true });

        metaDataMgr.addModel("CourseLng", "e1f6512f-c0e4-40b1-84bf-072bb6346fcb", "RootCourseLng", "c806b489-2081-4aac-9d23-6a11204d4d4f")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false })
            .addField("Name", { type: "string", length: 100, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("Category", "fa44e670-4ee6-4227-ab4d-083924a92d8a", "RootCategory", "6479905e-bdc3-45a8-8690-568ce3e698b9")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: false })
            .addField("ParentId", { type: "dataRef", model: "Category", refAction: "parentRestrict", allowNull: true });

        metaDataMgr.addModel("CategoryLng", "6bae1b6a-82d4-4f54-a953-080edf274588", "RootCategoryLng", "bd317677-91f9-44b2-b449-d368e42a2b6a")
            .addField("CategoryId", { type: "dataRef", model: "Category", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Name", { type: "string", length: 100, allowNull: false });

        metaDataMgr.addModel("CourseCategory", "61e14112-019b-42ac-9834-073af99a1597", "RootCourseCategory", "6b65ee98-e1fa-4580-9f90-ad835349a8e5")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false })
            .addField("CategoryId", { type: "dataRef", model: "Category", refAction: "parentRestrict", allowNull: false });

        metaDataMgr.addModel("Lesson", "caadef95-278b-4cad-acc9-a1e27380d6c6", "RootLesson", "819bf85f-e13b-4368-98e5-561f68f90ecd")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false })
            .addField("AuthorId", { type: "dataRef", model: "Author", refAction: "parentRestrict", allowNull: false })
            .addField("LessonType", { type: "enum", values: ["L", "T"], allowNull: false })
            .addField("Cover", { type: "string", length: 200, allowNull: true })
            .addField("URL", { type: "string", length: 200, allowNull: true });

        metaDataMgr.addModel("LessonLng", "7012a967-e186-43d8-b39c-1409b7f198b1", "RootLessonLng", "4dde1122-7556-4929-a81c-5c7679a5bbee")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false })
            .addField("Name", { type: "string", length: 100, allowNull: false })
            .addField("ShortDescription", { type: "string", length: 200, allowNull: false })
            .addField("FullDescription", { type: "string", allowNull: true });

        metaDataMgr.addModel("LessonCourse", "c93aa70c-6d24-4587-a723-79dbc9e65f99", "RootLessonCourse", "45616f57-8260-497d-9179-25eedce0ba68")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false })
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("Number", { type: "int", allowNull: false })
            .addField("ReadyDate", { type: "datetime", allowNull: true })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false });

        metaDataMgr.addModel("Reference", "b919a12f-5202-43b5-b1fc-481f75623659", "RootReference", "8d5fd37d-e686-4eec-a8e8-b7df91160a92")
            .addField("LessonLngId", { type: "dataRef", model: "LessonLng", refAction: "parentCascade", allowNull: false })
            .addField("Number", { type: "int", allowNull: false })
            .addField("Description", { type: "string", length: 200, allowNull: false })
            .addField("URL", { type: "string", length: 200, allowNull: true })
            .addField("Recommended", { type: "boolean", allowNull: true })
            .addField("AuthorComment", { type: "string", allowNull: true });

        metaDataMgr.addModel("Episode", "0299e4f3-280d-4622-82ca-8090966fcef6", "RootEpisode", "82466573-53fb-44e5-aec8-dc339d1a2fd8")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("EpisodeType", { type: "enum", values: ["L", "T"], allowNull: false });

        metaDataMgr.addModel("EpisodeLng", "e9a4a681-b2d9-48fe-8c82-cb2201d5ef77", "RootEpisodeLng", "f24fb64f-1e2f-4412-9380-9646181fdbe6")
            .addField("EpisodeId", { type: "dataRef", model: "Episode", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false })
            .addField("Name", { type: "string", length: 100, allowNull: false })
            .addField("Transcript", { type: "string", allowNull: true })
            .addField("Audio", { type: "string", length: 200, allowNull: true })
            .addField("Structure", { type: "string", allowNull: true });

        metaDataMgr.addModel("EpisodeLesson", "94d10a1d-d902-489b-8243-5c2dfea57174", "RootEpisodeLesson", "83abc96a-5184-4ed2-a9f2-ccd64733a22e")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: true })
            .addField("EpisodeId", { type: "dataRef", model: "Episode", refAction: "parentCascade", allowNull: false })
            .addField("Number", { type: "int", allowNull: false })
            .addField("Supp", { type: "boolean", allowNull: false });

        metaDataMgr.addModel("EpisodeToc", "3936efa7-f575-4de0-80ae-c92ab90f39ae", "RootEpisodeToc", "55fbcaae-b627-4227-944a-ed166b739c6f")
            .addField("EpisodeId", { type: "dataRef", model: "Episode", refAction: "parentCascade", allowNull: false })
            .addField("Number", { type: "int", allowNull: false });

        metaDataMgr.addModel("EpisodeTocLng", "fdf9eaf6-38b4-4c08-96b7-11ceee183318", "RootEpisodeTocLng", "3866b984-ed0b-4dfc-8567-de00401d5c95")
            .addField("EpisodeTocId", { type: "dataRef", model: "EpisodeToc", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Topic", { type: "string", length: 100, allowNull: false })
            .addField("TimeStamp", { type: "int", allowNull: false });

        metaDataMgr.checkSchema();
    }
}