'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 42]
//

const { ACCOUNT_ID, LANGUAGE_ID } = require('../../../const/sql-req-common');

exports.upgradeDb = async (schema) => {
    schema.getModel("PmLsnProcess")
        .addField("AudioReDo", { type: "boolean", allowNull: true })
};
