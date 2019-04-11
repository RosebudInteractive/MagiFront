'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 7]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Course")
        .addField("PaidTp", { type: "int", allowNull: true }) // 1-безусловно платный, 2-платный для зарегистрировавшихся после "PaidRegDate"
        .addField("PaidDate", { type: "datetime", allowNull: true })
        .addField("PaidRegDate", { type: "datetime", allowNull: true })
};
