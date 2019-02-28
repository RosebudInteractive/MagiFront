'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 5]
//
exports.upgradeDb = async (schema) => {
    schema.addModel("Book", "6ecd18be-2197-4826-bc6d-55bfef3954f7", "RootBook", "985a8646-39d9-42ef-ab9b-c1ca0ba735d0")
        .addField("Name", { type: "string", length: 255, allowNull: false })
        .addField("Description", { type: "string", allowNull: true })
        .addField("CourseId", { type: "dataRef", model: "Course", refAction: "parentRestrict", allowNull: true })
        .addField("OtherAuthors", { type: "string", allowNull: true })
        .addField("OtherCAuthors", { type: "string", allowNull: true })
        .addField("Cover", { type: "string", length: 255, allowNull: true })
        .addField("CoverMeta", { type: "string", allowNull: true })
        .addField("Order", { type: "int", allowNull: false })
        .addField("ExtLinks", { type: "string", allowNull: true });

    schema.addModel("BookAuthor", "e80790f0-e662-4340-afd3-1bdd3290352d", "RootBookAuthor", "f82c5f6a-ded9-467b-bd7a-9117aee98de3")
        .addField("BookId", { type: "dataRef", model: "Book", refAction: "parentCascade", allowNull: false })
        .addField("AuthorId", { type: "dataRef", model: "Author", refAction: "parentRestrict", allowNull: false })
        .addField("Tp", { type: "int", allowNull: false }) // "автор текста" - 1, "автор комментария" - 2, "автор перевода" - 3
        .addField("TpView", { type: "int", allowNull: false }); // "курс" - 1, "курс+лекция" - 2
}
