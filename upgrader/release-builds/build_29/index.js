'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 29]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("PromoCode")
        .addField("PromoProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: true })
        .addField("IsVisible", { type: "boolean", allowNull: true });

    schema.getModel("Product")
        .addField("AccName", { type: "string", length: 255, allowNull: true });

    schema.getModel("InvoiceItem")
        .addField("AccName", { type: "string", length: 255, allowNull: true });
};


exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper({ expr: { model: { name: "ProductType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Code: "COURSEPROMO",
                    Name: "Промокод на курс лекций",
                    ExtFields: `{"yandexKassa":{"payment_subject":"service"}}`
                }
            }, {});
        }, {})
};
