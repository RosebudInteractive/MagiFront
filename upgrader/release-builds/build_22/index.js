'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 22]
//
exports.upgradeDb = async (schema) => {

    schema.addModel("CourseMailing", "27f47d04-9cf4-42aa-b010-422e73821911", "RootCourseMailing", "6e2f0464-fe6d-4e52-a15e-d80177125415")
        .addField("MailingId", { type: "dataRef", model: "Mailing", refAction: "parentCascade", allowNull: false })
        .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false });

    schema.getModel("AuthorLng")
        .addField("ShortDescription", { type: "string", allowNull: true });
};
