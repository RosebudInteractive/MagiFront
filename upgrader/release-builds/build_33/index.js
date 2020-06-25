'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 33]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Discount")
        .addField("Code", { type: "string", length: 50, allowNull: true })
        .addField("TtlMinutes", { type: "int", allowNull: true });
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper({ expr: { model: { name: "DiscountType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Code: "COURSE_PERC_DYN",
                    Name: "Динамическая скидка на курс (%)",
                    Description: "Динамическая скидка на курс в %"
                }
            }, {});
        }, {})
};
