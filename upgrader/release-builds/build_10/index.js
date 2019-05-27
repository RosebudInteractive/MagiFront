'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 10]
//
exports.upgradeDb = async (schema) => {

    schema.addModel("PromoCode", "8dead93a-d366-400c-87f0-95ebe1825d42", "RootPromoCode", "da6b132f-1545-4c92-907c-84e869628383")
        .addField("Code", { type: "string", length: 50, allowNull: false })
        .addField("PriceListId", { type: "dataRef", model: "PriceList", refAction: "parentCascade", allowNull: false })
        .addField("Description", { type: "string", allowNull: true })
        .addField("Perc", { type: "decimal", precision: 8, scale: 4, allowNull: true })
        .addField("AbsVal", { type: "decimal", precision: 12, scale: 4, allowNull: true })
        .addField("Counter", { type: "int", allowNull: true })
        .addField("Rest", { type: "int", allowNull: true })
        .addField("FirstDate", { type: "datetime", allowNull: true })
        .addField("LastDate", { type: "datetime", allowNull: true });

    schema.addModel("PromoCodeProduct", "393a18a1-8f65-4714-81c7-31fe8b8f8690", "RootPromoCodeProduct", "b903c027-2531-4ff7-af83-a77c1c04d1d0")
        .addField("PromoCodeId", { type: "dataRef", model: "PromoCode", refAction: "parentCascade", allowNull: false })
        .addField("ProductId", { type: "dataRef", model: "Product", refAction: "parentRestrict", allowNull: false });

    schema.addModel("UserGiftCourse", "a0be5532-fe2f-41dc-a5f4-fa77d1e95a02", "RootUserGiftCourse", "706db19c-da5c-4024-b222-3144c3622573")
        .addField("UserId", { type: "dataRef", model: "User", refAction: "parentRestrict", allowNull: false })
        .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: false })
        .addField("PromoCodeId", { type: "dataRef", model: "PromoCode", refAction: "parentRestrict", allowNull: true })
        .addField("Sum", { type: "decimal", precision: 12, scale: 4, allowNull: true });

    schema.getModel("Cheque")
        .addField("PromoCodeId", { type: "dataRef", model: "PromoCode", refAction: "parentRestrict", allowNull: true })
        .addField("PromoSum", { type: "decimal", precision: 12, scale: 4, allowNull: true });
};
