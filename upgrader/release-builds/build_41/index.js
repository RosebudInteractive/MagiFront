'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 41]
//

const { ACCOUNT_ID, LANGUAGE_ID } = require('../../../const/sql-req-common');
const { AccountPermissionScheme, Permissions } = require('./permissions');

exports.upgradeDb = async (schema) => {
    let acc_model = schema.getModel("Account");
    acc_model.addField("PermissionScheme", { type: "json", allowNull: true })
    acc_model.customProps({ caption: "Учетные записи организаций" });

    schema.getModel("Role")
        .addField("IsBuiltIn", { type: "boolean", allowNull: true })
        .addField("Permissions", { type: "json", allowNull: true })

    schema.getModel("User")
        .addField("Permissions", { type: "json", allowNull: true })
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper({ expr: { model: { name: "Account" } } }, { field: "Domain", op: "=", value: "pmt" },
        async (root_obj) => {
            let collection = root_obj.getCol("DataElements");
            if (collection.count() != 1)
                throw new Error(`Account (Domain = "pmt") не найден.`);
            let acc_obj = collection.get(0);
            acc_obj.permissionScheme(AccountPermissionScheme);
        }, {});

    await opts.simpleEditWrapper({ expr: { model: { name: "Role" } } }, { field: "Id", op: ">", value: 0 },
        async (root_obj) => {
            let collection = root_obj.getCol("DataElements");
            let roles = {};
            for (let i = 0; i < collection.count(); i++) {
                let obj = collection.get(i);
                roles[obj.shortCode()] = obj;
                obj.isBuiltIn(obj.shortCode() === "a");
            }
            for (let key in Permissions) {
                let obj = roles[key];
                if (obj)
                    obj.permissions(Permissions[key]);
            }
        }, {});
};
