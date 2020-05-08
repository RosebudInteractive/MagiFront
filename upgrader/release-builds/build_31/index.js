'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 31]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("CourseReview", "30e3135c-04d1-47d0-8c4d-a80634867d3f", "RootCourseReview", "7ab42dfb-0a75-4acb-973c-c69aba76f59d")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false })
        .addField("ReviewDate", { type: "datetime", allowNull: false })
        .addField("Status", { type: "int", allowNull: false }) // 1- published, 2- draft, 3- archive 
        .addField("UserName", { type: "string", length: 255, allowNull: false })
        .addField("ProfileUrl", { type: "string", length: 255, allowNull: true })
        .addField("Title", { type: "string", length: 255, allowNull: true })
        .addField("Review", { type: "string", allowNull: false })
        .addField("ReviewPub", { type: "string", allowNull: true });
};
