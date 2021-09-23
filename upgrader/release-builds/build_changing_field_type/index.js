'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 41]
//

exports.upgradeDb = async (schema) => {
    let model = schema.getModel("CompletedLesson");
    model.getField("UserId").fieldType({ type: "int", allowNull: false });
    model.getField("LessonId").fieldType({ type: "int", allowNull: false });

    model = schema.getModel("LsnHistory");
    model.getField("UserId").fieldType({ type: "int", allowNull: false });
    model.getField("LessonId").fieldType({ type: "int", allowNull: false });
};
