'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 6]
//
exports.upgradeDb = async (schema) => {
    schema.getModel("Course")
        .addField("IsPaid", { type: "boolean", allowNull: true })
        .addField("IsSubsFree", { type: "boolean", allowNull: true })
        .addField("ProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: true });

    schema.getModel("Lesson")
        .addField("IsFreeInPaidCourse", { type: "boolean", allowNull: true });

    schema.getModel("Product")
        .addField("Ver", { type: "int", allowNull: true });

    schema.addModel("UserPaidCourse", "dbd115a0-68eb-4f8c-8c48-f2d04bbf17a3", "RootUserPaidCourse", "26ff2da4-bfc1-4396-a47a-d3160273216d")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false })
        .addField("Counter", { type: "int", allowNull: false });

    schema.addModel("DiscountType", "7f46d555-bf8b-45bb-af1c-dd8cb6093913", "RootDiscountType", "a0bc5e79-1574-422c-a25a-8ce2a95b02e9")
        .addField("Code", { type: "string", length: 50, allowNull: false })
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true });

    schema.addModel("Discount", "310d2273-5353-4166-ad96-82e65de4a8ea", "RootDiscount", "72febac9-9eb9-46d5-8a65-f72b202e06d1")
        .addField("DiscountTypeId", { type: "dataRef", model: "DiscountType", refAction: "parentRestrict", allowNull: false })
        .addField("PriceListId", { type: "dataRef", model: "PriceList", refAction: "parentCascade", allowNull: false })
        .addField("ProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: true })
        .addField("ProductTypeId", { type: "dataRef", model: "ProductType", refAction: "parentRestrict", allowNull: true })
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: true })
        .addField("Description", { type: "string", allowNull: true })
        .addField("Perc", { type: "decimal", precision: 7, scale: 4, allowNull: true })
        .addField("AbsVal", { type: "decimal", precision: 12, scale: 4, allowNull: true })
        .addField("FirstDate", { type: "datetime", allowNull: false })
        .addField("LastDate", { type: "datetime", allowNull: true });
};

exports.scriptUpgrade = async (options) => {
    let opts = options || {};

    await opts.simpleEditWrapper({ expr: { model: { name: "DiscountType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Code: "GENERAL_PERC",
                    Name: "Общая скидка (%)",
                    Description: "Скидка на все товары в %"
                }
            }, {});
            await root_obj.newObject({
                fields: {
                    Code: "COURSE_PERC",
                    Name: "Скидка на курс (%)",
                    Description: "Скидка на курс в %"
                }
            }, {});
        },{})

    await opts.simpleEditWrapper({ expr: { model: { name: "ProductType" } } }, { field: "Id", op: "=", value: -1 },
        async (root_obj) => {
            await root_obj.newObject({
                fields: {
                    Code: "COURSEONLINE",
                    Name: "Online курс лекций",
                    ExtFields: `{"yandexKassa":{"payment_subject":"service"}}`
                }
            }, {});
        }, {})
};
