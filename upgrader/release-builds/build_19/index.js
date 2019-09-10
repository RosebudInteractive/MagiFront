'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 19]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("CompletedLesson", "8e0932b8-73d9-4f10-8ad0-3c2a2141bb7d", "RootCompletedLesson", "0109f963-3367-4e8d-97b8-d4241c8a7148")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("LessonId", { type: "dataRef", model: "Lesson", refAction: "parentRestrict", allowNull: false });

    schema.getModel("Course")
        .addField("LandCover", { type: "string", length: 255, allowNull: true })
        .addField("LandCoverMeta", { type: "string", allowNull: true })
        .addField("IsLandingPage", { type: "boolean", allowNull: true });

    schema.getModel("CourseLng")
        .addField("ShortDescription", { type: "string", allowNull: true })
        .addField("TargetAudience", { type: "string", allowNull: true })
        .addField("Aims", { type: "string", allowNull: true })
        .addField("EstDuration", { type: "int", allowNull: true });

    schema.getModel("AuthorLng")
        .addField("Occupation", { type: "string", length: 255, allowNull: true })
        .addField("Employment", { type: "string", length: 255, allowNull: true });
};
