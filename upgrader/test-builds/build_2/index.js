'use strict';

exports.upgradeDb = async (schema) => {
    schema.getModel("Parameters")
        .addField("StrNew", { type: "string", allowNull: true });

    schema.addModel("NewTable", "fc6ddbe4-efa8-4c27-8cb0-ae97ebb03484", "RootNewTable", "fbc95e9e-8e90-40f8-aa02-55ae42587166")
        .addField("ChequeId", { type: "dataRef", model: "Cheque", refAction: "parentRestrict", allowNull: false });

    schema.getModel("NewTable")
        .inherit("NewTableDesc", "d38bf8ef-8a08-4de3-8ca3-dcd8111bc308", "RootNewTableDesc", "589ca53c-c4af-4f72-b371-59cbaccc04c6")
        .addField("Val", { type: "int", allowNull: false });    
}