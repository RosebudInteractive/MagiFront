const { Data } = require('../const/common');

exports.getSchemaGenFunc = function (uccelloDir) {
    return function (metaDataMgr) {
        const coreModels = require(uccelloDir + '/dataman/core-models');
        const Meta = require(uccelloDir + '/metadata/meta-defs');
        coreModels(metaDataMgr);

        metaDataMgr.addModel("Language", "fd4b9b70-514e-4796-9a27-eb0adf8e7944", "RootLanguage", "36ce5c73-0976-4b9e-bbeb-caaefd13bad0")
            .addField("Code", { type: "string", length: 3, allowNull: false })
            .addField("LangTag", { type: "string", length: 10, allowNull: false })
            .addField("ShortName", { type: "string", length: 10, allowNull: false })
            .addField("Language", { type: "string", length: 50, allowNull: false });
        
        metaDataMgr.addModel("Role", "e788831c-6f91-4bf6-ae6f-a21f0243d670", "RootRole", "b23a3900-6f89-4df4-b4e4-ca6d475b3d60")
            .addField("Code", { type: "string", length: 10, allowNull: false })
            .addField("Name", { type: "string", length: 50, allowNull: false })
            .addField("ShortCode", { type: "string", length: 5, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("Account", "81b276ee-a34a-4267-9f24-0fce75896c91", "RootAccount", "3a19b68f-50fe-4fa9-923e-0f14d6272a72")
            .addField("Domain", { type: "string", length: 50, allowNull: false })
            .addField("DefLangId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: true });

        metaDataMgr.addModel("AccountLng", "a3d4d86b-aa83-4a31-b655-88a8a846e36d", "RootAccountLng", "a0399798-fb12-4080-bb8e-82cc4bc0bb2d")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("SNetProvider", "fc1d1d24-7d61-4d38-a963-c617a022560e", "RootSNetProvider", "0f0b2dfb-6899-413a-8af5-644598bbef6b")
            .addField("Code", { type: "string", length: 20, allowNull: false })
            .addField("Name", { type: "string", length: 50, allowNull: false })
            .addField("URL", { type: "string", length: 200, allowNull: true });

        metaDataMgr.getModel("SysUser")
            .inherit("User", "ad96cb5d-a5a7-4fae-b8b7-738ca992fcd4", "RootUser", "5ef58b64-044e-42e4-b43c-3f8c455bb139")
            .addField("OwnedAccount", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: true })
            .addField("Name", { type: "string", length: 255, allowNull: true })
            .addField("DisplayName", { type: "string", length: 255, allowNull: true })
            .addField("Email", { type: "string", length: 255, allowNull: false })
            .addField("URL", { type: "string", length: 255, allowNull: true })
            .addField("Phone", { type: "string", length: 50, allowNull: true })
            .addField("RegDate", { type: "datetime", allowNull: true })
            .addField("ExpDate", { type: "datetime", allowNull: true })
            .addField("SubsExpDate", { type: "datetime", allowNull: true })
            .addField("SubsAutoPay", { type: "boolean", allowNull: true })
            .addField("SubsAutoPayId", { type: "dataRef", model: "Cheque", refAction: "parentRestrict", allowNull: true })
            .addField("SubsProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: true })
            .addField("ActivationKey", { type: "string", length: 50, allowNull: true })
            .addField("Status", { type: "int", allowNull: true })
            .addField("IsOld", { type: "boolean", allowNull: true })
            .addField("PData", { type: "string", allowNull: true })
            .addField("PwdHashOld", { type: "string", length: 255, allowNull: true });

        metaDataMgr.addModel("AutoSubscription", "6316e744-c889-4ebe-b7ae-78cc0b57b979", "RootAutoSubscription", "d788dd46-3611-4c6d-a173-5da138c8e9f0")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
            .addField("SubsExpDate", { type: "datetime", allowNull: false })
            .addField("NextSubsExpDate", { type: "datetime", allowNull: false })
            .addField("ChequeId", { type: "dataRef", model: "Cheque", refAction: "parentRestrict", allowNull: true })
            .addField("ProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: true })
            .addField("Succeeded", { type: "boolean", allowNull: false })
            .addField("Error", { type: "string", allowNull: true })
        
        metaDataMgr.addModel("SubsNotification", "043dfc13-0795-42d4-8791-7c2fb43c48d5", "RootSubsNotification", "35a8e4a5-3ea7-4537-bfa2-6228f15df68e")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
            .addField("SubsExpDate", { type: "datetime", allowNull: false })
            .addField("Days", { type: "int", allowNull: false })

        metaDataMgr.addModel("SNetProfile", "54c9008e-4916-4972-a5f3-7325d229df68", "RootSNetProfile", "45d677c1-9784-426a-b255-024eaa6f1ebc")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentCascade", allowNull: false })
            .addField("ProviderId", { type: "dataRef", model: "SNetProvider", refAction: "parentRestrict", allowNull: false })
            .addField("Identifier", { type: "string", length: 50, allowNull: false })
            .addField("URL", { type: "string", length: 255, allowNull: true })
            .addField("WebSite", { type: "string", length: 255, allowNull: true })
            .addField("PhotoUrl", { type: "string", length: 255, allowNull: true })
            .addField("DisplayName", { type: "string", length: 50, allowNull: true })
            .addField("Description", { type: "string", allowNull: true })
            .addField("FirstName", { type: "string", length: 50, allowNull: true })
            .addField("LastName", { type: "string", length: 50, allowNull: true })
            .addField("Gender", { type: "string", length: 10, allowNull: true })
            .addField("Language", { type: "string", length: 10, allowNull: true })
            .addField("Age", { type: "int", allowNull: true })
            .addField("DayOfBirth", { type: "int", allowNull: true })
            .addField("MonthOfBirth", { type: "int", allowNull: true })
            .addField("YearOfBirth", { type: "int", allowNull: true })
            .addField("Email", { type: "string", length: 255, allowNull: true })
            .addField("EmailVerified", { type: "string", length: 255, allowNull: true })
            .addField("Phone", { type: "string", length: 25, allowNull: true })
            .addField("Address", { type: "string", length: 100, allowNull: true })
            .addField("Country", { type: "string", length: 50, allowNull: true })
            .addField("Region", { type: "string", length: 50, allowNull: true })
            .addField("City", { type: "string", length: 50, allowNull: true })
            .addField("Zip", { type: "string", length: 50, allowNull: true })
            .addField("IsOld", { type: "boolean", allowNull: false })
            .addField("IsUpdated", { type: "boolean", allowNull: false });
        
        metaDataMgr.addModel("UserRole", "86e022dd-13d9-4c9d-811c-76b2ac807cff", "RootUserRole", "87c43f07-15f7-47d3-9309-263c14d71959")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: false })
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentCascade", allowNull: false })
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
            .addField("Portrait", { type: "string", length: 255, allowNull: true })
            .addField("PortraitMeta", { type: "string", allowNull: true })
            .addField("RawPortraitMeta", { type: "string", allowNull: true })
            .addField("URL", { type: "string", length: 255, allowNull: false });

        metaDataMgr.addModel("AuthorLng", "2efeead7-684d-46fa-b11b-555ffb2da5a6", "RootAuthorLng", "e306cc09-7c70-4dda-b428-a361eae7e1a2")
            .addField("AuthorId", { type: "dataRef", model: "Author", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("FirstName", { type: "string", length: 255, allowNull: false })
            .addField("LastName", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("AuthorToCourse", "2f0ce749-4169-4ec0-9a87-0ffd405a4337", "RootAuthorToCourse", "feebc518-1fa6-4051-b39e-7958ed30feb7")
            .addField("AuthorId", { type: "dataRef", model: "Author", refAction: "parentRestrict", allowNull: false })
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false });

        metaDataMgr.addModel("Course", "5995f1c7-43dc-4367-8071-532702b94235", "RootCourse", "f3500436-4b99-48a7-a60b-8b6d6e1a9ac8")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "P", "A"], allowNull: false })
            .addField("Cover", { type: "string", length: 255, allowNull: true })
            .addField("CoverMeta", { type: "string", allowNull: true })
            .addField("RawCoverMeta", { type: "string", allowNull: true })
            .addField("Mask", { type: "string", length: 20, allowNull: true })
            .addField("Color", { type: "int", allowNull: true })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: true })
            .addField("OneLesson", { type: "boolean", allowNull: false })
            .addField("URL", { type: "string", length: 255, allowNull: false });

        metaDataMgr.addModel("CourseLng", "e1f6512f-c0e4-40b1-84bf-072bb6346fcb", "RootCourseLng", "c806b489-2081-4aac-9d23-6a11204d4d4f")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("CrsShareCounter", "d54482f1-94fa-463d-9efd-7ab7711d9a15", "RootCrsShareCounter", "0a239450-47e0-406c-b4e4-e7c303c8ea1c")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false })
            .addField("SNetProviderId", { type: "dataRef", model: "SNetProvider", refAction: "parentRestrict", allowNull: false })
            .addField("Counter", { type: "int", allowNull: false });

        metaDataMgr.addModel("Category", "fa44e670-4ee6-4227-ab4d-083924a92d8a", "RootCategory", "6479905e-bdc3-45a8-8690-568ce3e698b9")
            .addField("AccountId", { type: "dataRef", model: "Account", refAction: "parentRestrict", allowNull: false })
            .addField("ParentId", { type: "dataRef", model: "Category", refAction: "parentRestrict", allowNull: true })
            .addField("URL", { type: "string", length: 255, allowNull: false });

        metaDataMgr.addModel("CategoryLng", "6bae1b6a-82d4-4f54-a953-080edf274588", "RootCategoryLng", "bd317677-91f9-44b2-b449-d368e42a2b6a")
            .addField("CategoryId", { type: "dataRef", model: "Category", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", length: 255, allowNull: true });

        metaDataMgr.addModel("CourseCategory", "61e14112-019b-42ac-9834-073af99a1597", "RootCourseCategory", "6b65ee98-e1fa-4580-9f90-ad835349a8e5")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false })
            .addField("CategoryId", { type: "dataRef", model: "Category", refAction: "parentRestrict", allowNull: false });

        metaDataMgr.addModel("Lesson", "caadef95-278b-4cad-acc9-a1e27380d6c6", "RootLesson", "819bf85f-e13b-4368-98e5-561f68f90ecd")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false })
            .addField("AuthorId", { type: "dataRef", model: "Author", refAction: "parentRestrict", allowNull: false })
            .addField("ParentId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: true })
            .addField("LessonType", { type: "enum", values: ["L", "T"], allowNull: false })
            .addField("Cover", { type: "string", length: 255, allowNull: true })
            .addField("CoverMeta", { type: "string", allowNull: true })
            .addField("RawCoverMeta", { type: "string", allowNull: true })
            .addField("IsAuthRequired", { type: "boolean", allowNull: false })
            .addField("IsSubsRequired", { type: "boolean", allowNull: false })
            .addField("FreeExpDate", { type: "datetime", allowNull: true })
            .addField("URL", { type: "string", length: 255, allowNull: false });

        metaDataMgr.addModel("LessonLng", "7012a967-e186-43d8-b39c-1409b7f198b1", "RootLessonLng", "4dde1122-7556-4929-a81c-5c7679a5bbee")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("ShortDescription", { type: "string", allowNull: false })
            .addField("FullDescription", { type: "string", allowNull: true })
            .addField("SnPost", { type: "string", allowNull: true })
            .addField("SnName", { type: "string", allowNull: true })
            .addField("SnDescription", { type: "string", allowNull: true })
            .addField("Duration", { type: "int", allowNull: true })
            .addField("DurationFmt", { type: "string", length: 15, allowNull: true });

        metaDataMgr.addModel("LessonMetaImage", "0eba67e3-ff9f-4c81-87f4-72e95816bc05", "LessonRootMetaImage", "84ba5f1d-29d6-49f7-9884-03171320957d")
            .addField("LessonLngId", { type: "dataRef", model: "LessonLng", refAction: "parentCascade", allowNull: false })
            .addField("Type", { type: "string", length: 50, allowNull: false })
            .addField("ResourceId", { type: "dataRef", model: "Resource", refAction: "parentRestrict", allowNull: false });
        
        metaDataMgr.addModel("LessonCourse", "c93aa70c-6d24-4587-a723-79dbc9e65f99", "RootLessonCourse", "45616f57-8260-497d-9179-25eedce0ba68")
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentCascade", allowNull: false })
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: false })
            .addField("ParentId", { type: "dataRef", model: "LessonCourse", refAction: "parentRestrict", allowNull: true })
            .addField("Number", { type: "int", allowNull: false })
            .addField("ReadyDate", { type: "datetime", allowNull: true })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false });

        metaDataMgr.addModel("LsnShareCounter", "484a1f53-0e76-4d13-8cd0-ca8f1ef88dec", "RootLsnShareCounter", "fd4c7303-1699-439e-9555-b64994bfd72d")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("SNetProviderId", { type: "dataRef", model: "SNetProvider", refAction: "parentRestrict", allowNull: false })
            .addField("Counter", { type: "int", allowNull: false });

        metaDataMgr.addModel("LsnPosition", "e5ddab7f-5e4c-4870-b68a-3db40a0957dc", "RootLsnPosition", "aae5d76e-96dd-4f54-96c6-a5b2845bb108")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("Ts", { type: "float", allowNull: false })
            .addField("LsnTime", { type: "float", allowNull: false })
            .addField("UserTime", { type: "float", allowNull: false })
            .addField("Position", { type: "float", allowNull: false })
            .addField("IsFinished", { type: "boolean", allowNull: false })
            .addField("RawPosition", { type: "string", allowNull: false });

        metaDataMgr.addModel("Reference", "b919a12f-5202-43b5-b1fc-481f75623659", "RootReference", "8d5fd37d-e686-4eec-a8e8-b7df91160a92")
            .addField("LessonLngId", { type: "dataRef", model: "LessonLng", refAction: "parentCascade", allowNull: false })
            .addField("Number", { type: "int", allowNull: false })
            .addField("Description", { type: "string", allowNull: false })
            .addField("URL", { type: "string", allowNull: true })
            .addField("Recommended", { type: "boolean", allowNull: false })
            .addField("AuthorComment", { type: "string", allowNull: true });

        metaDataMgr.addModel("Episode", "0299e4f3-280d-4622-82ca-8090966fcef6", "RootEpisode", "82466573-53fb-44e5-aec8-dc339d1a2fd8")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("EpisodeType", { type: "enum", values: ["L", "T"], allowNull: false });

        metaDataMgr.addModel("EpisodeLng", "e9a4a681-b2d9-48fe-8c82-cb2201d5ef77", "RootEpisodeLng", "f24fb64f-1e2f-4412-9380-9646181fdbe6")
            .addField("EpisodeId", { type: "dataRef", model: "Episode", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("State", { type: "enum", values: ["D", "R", "A"], allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Transcript", { type: "string", allowNull: true })
            .addField("Audio", { type: "string", length: 255, allowNull: true })
            .addField("AudioMeta", { type: "string", allowNull: true })
            .addField("RawAudioMeta", { type: "string", allowNull: true })
            .addField("Structure", { type: "string", allowNull: true })
            .addField("Duration", { type: "int", allowNull: true });

        metaDataMgr.addModel("EpisodeLesson", "94d10a1d-d902-489b-8243-5c2dfea57174", "RootEpisodeLesson", "83abc96a-5184-4ed2-a9f2-ccd64733a22e")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: false })
            .addField("EpisodeId", { type: "dataRef", model: "Episode", refAction: "parentRestrict", allowNull: false })
            .addField("Number", { type: "int", allowNull: false })
            .addField("Supp", { type: "boolean", allowNull: false });

        metaDataMgr.addModel("EpisodeToc", "3936efa7-f575-4de0-80ae-c92ab90f39ae", "RootEpisodeToc", "55fbcaae-b627-4227-944a-ed166b739c6f")
            .addField("EpisodeId", { type: "dataRef", model: "Episode", refAction: "parentCascade", allowNull: false })
            .addField("Number", { type: "int", allowNull: false });

        metaDataMgr.addModel("EpisodeTocLng", "fdf9eaf6-38b4-4c08-96b7-11ceee183318", "RootEpisodeTocLng", "3866b984-ed0b-4dfc-8567-de00401d5c95")
            .addField("EpisodeTocId", { type: "dataRef", model: "EpisodeToc", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Topic", { type: "string", length: 255, allowNull: false })
            .addField("StartTime", { type: "int", allowNull: false });

        metaDataMgr.addModel("EntityType", "59411fd7-3b22-4ed7-bc03-d7536fef74b9", "RootEntityType", "ef2277ad-49ef-4f0d-8c80-5abebbdd9c76")
            .addField("Code", { type: "string", length: 50, allowNull: false });

        metaDataMgr.addModel("EntityTypeLng", "c942f8fa-a0aa-4024-bd5a-939bbe6490c1", "RootEntityTypeLng", "33efa9c5-1ed5-4aef-a996-1cffc582a847")
            .addField("EntityTypeId", { type: "dataRef", model: "EntityType", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false });

        metaDataMgr.addModel("Entity", "d5db7d84-7418-4d90-87fc-10f675f12587", "RootEntity", "46c70949-19a0-418d-b2ba-2f338978fe31")
            .addField("EntityTypeId", { type: "dataRef", model: "EntityType", refAction: "parentRestrict", allowNull: false });

        metaDataMgr.addModel("EntityLng", "00c07c36-6dd1-4920-a534-1f08e50cd002", "RootEntityLng", "dc5a5bf0-52b2-4ff6-b355-dc144dc23bfe")
            .addField("EntityId", { type: "dataRef", model: "Entity", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false });

        metaDataMgr.addModel("Resource", "89e7a678-5414-498f-b635-b172bf402816", "RootResource", "5c605246-56ff-4b40-9c27-242e678899e4")
            .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentCascade", allowNull: false })
            .addField("EntityId", { type: "dataRef", model: "Entity", refAction: "parentRestrict", allowNull: true })
            .addField("ResLanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: true })
            .addField("ResType", { type: "enum", values: ["P", "V"], allowNull: false })
            .addField("FileName", { type: "string", length: 255, allowNull: false })
            .addField("ShowInGalery", { type: "boolean", allowNull: true })
            .addField("MetaData", { type: "string", allowNull: true })
            .addField("RawMetaData", { type: "string", allowNull: true });

        metaDataMgr.addModel("ResourceLng", "08fc5411-e11e-48be-bbb4-b7638a600f71", "RootResourceLng", "4f1238b4-c65c-4c19-bea8-b67413d724aa")
            .addField("ResourceId", { type: "dataRef", model: "Resource", refAction: "parentCascade", allowNull: false })
            .addField("LanguageId", { type: "dataRef", model: "Language", refAction: "parentRestrict", allowNull: false })
            .addField("Name", { type: "string", allowNull: false })
            .addField("Description", { type: "string", allowNull: true })
            .addField("AltAttribute", { type: "string", length: 255, allowNull: true });

        metaDataMgr.addModel("EpisodeContent", "b6b2fbd3-57e6-48c1-aa8b-7751daa2bfed", "RootEpisodeContent", "1996d0fc-a93f-420f-b1c3-627fef86bb60")
            .addField("EpisodeLngId", { type: "dataRef", model: "EpisodeLng", refAction: "parentRestrict", allowNull: false })
            .addField("ResourceId", { type: "dataRef", model: "Resource", refAction: "parentRestrict", allowNull: false })
            .addField("CompType", { type: "enum", values: ["PIC", "VDO", "TXT", "TLN"], allowNull: false })
            .addField("StartTime", { type: "int", allowNull: false })
            .addField("Duration", { type: "int", allowNull: false })
            .addField("Content", { type: "string", allowNull: true });

        metaDataMgr.addModel("Bookmark", "c1b21a84-9a78-43aa-aee6-57cf1d7da19c", "RootBookmark", "d0c73f6d-04dd-486c-a6ae-4317663de11b")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentCascade", allowNull: false })
            .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: true })
            .addField("LessonCourseId", { type: "dataRef", model: "LessonCourse", refAction: "parentRestrict", allowNull: true });

        metaDataMgr.addModel("PushSubscription", "", "RootPushSubscription", "")
            .addField("EndPoint", { type: "string", length: Data.ENDPOINT_FIELD_LENGTH, allowNull: false })
            .addField("Data", { type: "string", allowNull: false });

        metaDataMgr.addModel("Mailing", "7ea07bf1-e339-4616-975d-7a9f8f172093", "RootMailing", "81e84c39-5490-47ee-afaa-463d597013d2")
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("SenderName", { type: "string", length: 255, allowNull: false })
            .addField("SenderEmail", { type: "string", length: 255, allowNull: false })
            .addField("Subject", { type: "string", length: 255, allowNull: false })
            .addField("BookId", { type: "int", allowNull: false })
            .addField("Body", { type: "string", allowNull: false })
            .addField("IsSent", { type: "boolean", allowNull: false })
            .addField("CampaignId", { type: "int", allowNull: true })
            .addField("Status", { type: "int", allowNull: true })
            .addField("ResBody", { type: "string", allowNull: true });

        metaDataMgr.addModel("LsnMailing", "8dbdc40b-4360-4f80-8ef5-c1eb436dd781", "RootLsnMailing", "c07c0736-f97b-4965-a622-f0b0e74c535f")
            .addField("MailingId", { type: "dataRef", model: "Mailing", refAction: "parentCascade", allowNull: false })
            .addField("LessonId", { type: "int", allowNull: false });

        metaDataMgr.addModel("Feedback", "3446c50a-6b58-4d42-8a57-bb87e42494d5", "RootFeedback", "5099cf78-6aff-4717-ba04-973626d4d8da")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentCascade", allowNull: true })
            .addField("Recipients", { type: "string", length: 255, allowNull: true })
            .addField("SenderContact", { type: "string", allowNull: false })
            .addField("MessageText", { type: "string", allowNull: false })
            .addField("Subject", { type: "string", length: 255, allowNull: true })
            .addField("Body", { type: "string", allowNull: true })
            .addField("Status", { type: "string", length: 50, allowNull: false })
            .addField("ResBody", { type: "string", allowNull: true });

        metaDataMgr.addModel("ProductType", "a226321b-04fa-40c8-8c53-6efff100fb1f", "RootProductType", "fae9c1e4-b735-4241-a06e-a56333762e0b")
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("Currency", "8f5503e0-ce9d-447b-9b9b-e0ca03c5c376", "RootCurrency", "e00b80e3-0fbe-48c1-847c-8fbffe1e6cb4")
            .addField("Code", { type: "string", length: 20, allowNull: false })
            .addField("Symbol", { type: "string", length: 5, allowNull: false }) // ք, $, €, £
            .addField("Name", { type: "string", length: 255, allowNull: false });

        metaDataMgr.addModel("VATType", "c0c9f48b-d057-4139-aa48-0761a92e239b", "RootVATType", "ec912725-a333-4f5d-93d1-bf6c1ec2babd")
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true })
            .addField("ExtFields", { type: "string", allowNull: true });

        metaDataMgr.addModel("VATRate", "dfd5a184-7595-44d9-9dd1-64e8e10b02d9", "RootVATRate", "9ede10eb-10f4-400f-a51e-52ec9aa707ec")
            .addField("VATTypeId", { type: "dataRef", model: "VATType", refAction: "parentCascade", allowNull: false })
            .addField("Rate", { type: "decimal", precision: 6, scale: 4, allowNull: false })
            .addField("ExtFields", { type: "string", allowNull: true })
            .addField("FirstDate", { type: "datetime", allowNull: false })
            .addField("LastDate", { type: "datetime", allowNull: true });

        metaDataMgr.addModel("Product", "76e0b31d-899b-4806-8272-95fa283e7cdb", "RootProduct", "ab6d0779-1a8f-4486-a428-697fcd10f7fe")
            .addField("ProductTypeId", { type: "dataRef", model: "ProductType", refAction: "parentRestrict", allowNull: false })
            .addField("VATTypeId", { type: "dataRef", model: "VATType", refAction: "parentRestrict", allowNull: false })
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Picture", { type: "string", length: 255, allowNull: true })
            .addField("PictureMeta", { type: "string", allowNull: true })
            .addField("Description", { type: "string", allowNull: true })
            .addField("Discontinued", { type: "boolean", allowNull: false })
            .addField("ExtFields", { type: "string", allowNull: true });

        metaDataMgr.addModel("PriceList", "aed10527-ed66-4a5b-864f-05463edba73c", "RootPriceList", "414407d4-01f6-44cc-b9f7-c2cb21bb7f4f")
            .addField("CurrencyId", { type: "dataRef", model: "Currency", refAction: "parentRestrict", allowNull: false })
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("Price", "ff0e3c29-b8a9-4bb2-a764-d1ba308188be", "RootPrice", "e67b1a90-073e-4d2d-81c4-ac13ec6caa5f")
            .addField("PriceListId", { type: "dataRef", model: "PriceList", refAction: "parentCascade", allowNull: false })
            .addField("ProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: false })
            .addField("Price", { type: "decimal", precision: 12, scale: 4, allowNull: false })
            .addField("FirstDate", { type: "datetime", allowNull: false })
            .addField("LastDate", { type: "datetime", allowNull: true });

        metaDataMgr.addModel("InvoiceType", "fff2ecf1-b5be-4d00-b102-fbaebb1d7f5f", "RootInvoiceType", "5f592dd0-24e1-41f0-9ad0-e4cb6ccfbe7f")
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("InvoiceState", "61914e17-649c-49e3-a64c-1fd282eeda5e", "RootInvoiceState", "70e22c90-2523-4ec8-9c21-a7214812667b")
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("Invoice", "04cb63fb-c922-465b-bd6c-a6d86aaa5d0b", "RootInvoice", "db354256-c562-41a4-a055-d9fa8d3c909f")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
            .addField("ParentId", { type: "dataRef", model: "Invoice", refAction: "parentRestrict", allowNull: true })
            .addField("InvoiceTypeId", { type: "dataRef", model: "InvoiceType", refAction: "parentRestrict", allowNull: false })
            .addField("StateId", { type: "dataRef", model: "InvoiceState", refAction: "parentRestrict", allowNull: false })
            .addField("CurrencyId", { type: "dataRef", model: "Currency", refAction: "parentRestrict", allowNull: false })
            .addField("ChequeId", { type: "dataRef", model: "Cheque", refAction: "parentRestrict", allowNull: true })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true })
            .addField("InvoiceNum", { type: "string", length: 255, allowNull: false })
            .addField("InvoiceDate", { type: "datetime", allowNull: false })
            .addField("Sum", { type: "decimal", precision: 12, scale: 4, allowNull: false })
            .addField("RefundSum", { type: "decimal", precision: 12, scale: 4, allowNull: false });

        metaDataMgr.addModel("InvoiceItem", "09280816-42fe-4f1c-bcad-988cd3f6c2ad", "RootInvoiceItem", "7a8e98d7-6bfb-41df-afe2-2cf19d01ea94")
            .addField("InvoiceId", { type: "dataRef", model: "Invoice", refAction: "parentCascade", allowNull: false })
            .addField("ParentId", { type: "dataRef", model: "InvoiceItem", refAction: "parentRestrict", allowNull: true })
            .addField("ProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: false })
            .addField("VATTypeId", { type: "dataRef", model: "VATType", refAction: "parentRestrict", allowNull: false })
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("VATRate", { type: "decimal", precision: 6, scale: 4, allowNull: false })
            .addField("Price", { type: "decimal", precision: 12, scale: 4, allowNull: false })
            .addField("Qty", { type: "decimal", precision: 10, scale: 4, allowNull: false })
            .addField("RefundQty", { type: "decimal", precision: 10, scale: 4, allowNull: false })
            .addField("ExtFields", { type: "string", allowNull: true });

        metaDataMgr.addModel("ChequeType", "111c7c08-3fef-47a8-9fde-59d8c10559e4", "RootChequeType", "f5c2521c-cfc4-425b-bd07-309ffc2b6f73")
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("ChequeState", "b2562862-8fb2-4f82-ba2a-dc36676c1be6", "RootChequeState", "5098f53c-01a0-4439-b7a9-df230347f782")
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("ReceiptState", "0758ed86-79a0-4006-8a9e-01efce113dda", "RootReceiptState", "3663d347-3cee-4b9e-9ca5-9a0754254592")
            .addField("Code", { type: "string", length: 50, allowNull: false })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("Description", { type: "string", allowNull: true });

        metaDataMgr.addModel("Cheque", "51e54d9c-2265-4895-b958-fdddaf69b10d", "RootCheque", "6e51fd38-a635-4182-8eda-b855e696c504")
            .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
            .addField("ParentId", { type: "dataRef", model: "Cheque", refAction: "parentRestrict", allowNull: true })
            .addField("ChequeTypeId", { type: "dataRef", model: "ChequeType", refAction: "parentRestrict", allowNull: false })
            .addField("StateId", { type: "dataRef", model: "ChequeState", refAction: "parentRestrict", allowNull: false })
            .addField("CurrencyId", { type: "dataRef", model: "Currency", refAction: "parentRestrict", allowNull: false })
            .addField("InvoiceId", { type: "dataRef", model: "Invoice", refAction: "parentRestrict", allowNull: true })
            .addField("ReceiptStateId", { type: "dataRef", model: "ReceiptState", refAction: "parentRestrict", allowNull: true })
            .addField("Name", { type: "string", length: 255, allowNull: false })
            .addField("ChequeNum", { type: "string", length: 50, allowNull: false })
            .addField("ChequeDate", { type: "datetime", allowNull: false })
            .addField("ChequeData", { type: "string", allowNull: true })
            .addField("IsSaved", { type: "boolean", allowNull: false })
            .addField("ReceiptEmail", { type: "string", length: 255, allowNull: true })
            .addField("ReceiptPhone", { type: "string", length: 50, allowNull: true })
            .addField("Sum", { type: "decimal", precision: 12, scale: 4, allowNull: false })
            .addField("RefundSum", { type: "decimal", precision: 12, scale: 4, allowNull: false });

        metaDataMgr.addModel("ChequeLog", "aa0f517a-23cd-4a51-8073-58d86b583f97", "RootChequeLog", "e989a4ca-1e67-46a0-b45f-021bb74da09c")
            .addField("ChequeId", { type: "dataRef", model: "Cheque", refAction: "parentRestrict", allowNull: false })
            .addField("ResultCode", { type: "string", length: 50, allowNull: false })
            .addField("Operation", { type: "string", length: 255, allowNull: false })
            .addField("Request", { type: "string", allowNull: true })
            .addField("Response", { type: "string", allowNull: true });

        metaDataMgr.checkSchema();
    }
}