'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 23]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Course")
        .addField("CourseType", { type: "int", allowNull: true }); // 1- теоретический курс, 2- практический
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper({ expr: { model: { name: "SNetProvider" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Code: "apple",
                    Name: "Apple",
                    URL: "https://appleid.apple.com"
                }
            }, {});
        }, {});
};
