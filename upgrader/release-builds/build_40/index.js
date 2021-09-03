'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 40]
//

const { ACCOUNT_ID, LANGUAGE_ID } = require('../../../const/sql-req-common');

exports.upgradeDb = async (schema) => {
    schema.getModel("PmTask")
        .addField("IsFinal", { type: "boolean", allowNull: true })
        .addField("IsAutomatic", { type: "boolean", allowNull: true })
        .addField("IsActive", { type: "boolean", allowNull: true })

    schema.getModel("PmDepTask")
        .addField("IsConditional", { type: "boolean", allowNull: true })
        .addField("IsDefault", { type: "boolean", allowNull: true })
        .addField("IsActive", { type: "boolean", allowNull: true })
        .addField("Result", { type: "boolean", allowNull: true })
        .addField("Expression", { type: "string", allowNull: true })
};
