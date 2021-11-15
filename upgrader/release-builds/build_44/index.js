'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 44]
//

const { ACCOUNT_ID, LANGUAGE_ID } = require('../../../const/sql-req-common');

exports.upgradeDb = async (schema) => {
    schema.getModel("User")
        .addField("HasAppNotifCfg", { type: "boolean", allowNull: true })
};
