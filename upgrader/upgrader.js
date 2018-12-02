'use strict';
process.env["NODE_CONFIG_DIR"] = "../config/";
const config = require('config');
const _ = require('lodash');
const { magisteryConfig } = require("../etc/config")
const { buildLogString, getTimeStr } = require('../utils');
const { DbEngineInit } = require("../database/dbengine-init");

const dbInitObject = new DbEngineInit(magisteryConfig);

const { DbUtils } = require('../database/db-utils');
const Meta = require(UCCELLO_CONFIG.uccelloPath + 'metadata/meta-defs');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

let resMan = null;
let dataObjectEngine = null;

function newVersion(schema) {
    schema.getModel("Parameters")
        .addField("StrNew", { type: "string", allowNull: true });

    schema.addModel("NewTable", "fc6ddbe4-efa8-4c27-8cb0-ae97ebb03484", "RootNewTable", "fbc95e9e-8e90-40f8-aa02-55ae42587166")
        .addField("ChequeId", { type: "dataRef", model: "Cheque", refAction: "parentRestrict", allowNull: false });

    schema.getModel("NewTable")
        .inherit("NewTableDesc", "d38bf8ef-8a08-4de3-8ca3-dcd8111bc308", "RootNewTableDesc", "589ca53c-c4af-4f72-b371-59cbaccc04c6")
        .addField("Val", { type: "int", allowNull: false });
}

class Upgrader{

    constructor(options) {
        let opts = options || {};
        if (!(this._resMan = opts.resMan))
            throw new Error(`Argument "resMan" is missing.`);
        if (!(this._dataObjectEngine = opts.dataObjectEngine))
            throw new Error(`Argument "dataObjectEngine" is missing.`);
    }

    async _fillTypeModel(aNewModels) {

        let options = { dbRoots: [] };
        let root_obj;
        let db = $memDataBase;

        let newModels = _.clone(aNewModels);
        newModels.sort((a, b) => {
            return a.getActualTypeId() - b.getActualTypeId();
        })

        await Utils.editDataWrapper(() => {
            return new MemDbPromise(db, (resolve, reject) => {
                var predicate = new Predicate(db, {});
                predicate
                    .addCondition({ field: "Id", op: "=", value: -1 });
                let exp =
                {
                    expr: {
                        model: {
                            name: Meta.TYPE_MODEL_NAME,
                        },
                        predicate: predicate.serialize(true)
                    }
                };
                db._deleteRoot(predicate.getRoot());
                resolve(db.getData(Utils.guid(), null, null, exp, {}));
            })
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("Invalid result of \"getData\": " + JSON.stringify(result));

                    options.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    return Utils.seqExec(newModels, async (model) => {
                        let objId = model.getActualTypeId();
                        let fields = {
                            Id: objId,
                            TypeGuid: model.dataObjectGuid(),
                            ModelName: model.name()
                        };
                        let ancestors = model.getAncestors();
                        if (ancestors.length > 0)
                            fields.ParentTypeId = ancestors[ancestors.length - 1].getActualTypeId();
                        return root_obj.newObject({
                            fields: fields
                        }, {})
                            .then(result => {
                                let new_obj = db.getObj(result.newObject);
                                new_obj.id(objId);
                            });
                    });
                })
                .then(() => {
                    return root_obj.save();
                })
                .then(() => {
                    let typeModel = this._dataObjectEngine.getSchema().getModel(Meta.TYPE_MODEL_NAME);
                    return this._dataObjectEngine.getQuery().setTableRowId(typeModel);
                })
        }, options);

        return newModels;
    }

    async createNewBuild(newModels, updModels) {
        await this._resMan.createNewBuild();
        console.log(`New build has been created.`);
    }

    async upgrade() {
        await this._dataObjectEngine.whenIsReady();

        console.log(buildLogString(`READY!`));
        let schema = this._dataObjectEngine.getSchema();

        this._dataObjectEngine.saveSchemaToFile("../../upgrader-test/before");

        let models = {};
        schema.models().forEach(model => {
            if ((!model.isTypeModel()) && (!model.isVirtual()))
                models[model.name()] = {
                    model: model,
                    checkSum: JSON.stringify(model.serialize(model, true))
                };
        });

        newVersion(schema);
        schema.checkSchema();

        let newModels = [];
        let updModels = [];
        schema.models().forEach(model => {
            if ((!model.isTypeModel()) && (!model.isVirtual())) {
                let modelRec = models[model.name()];
                if (modelRec) {
                    let checkSum = JSON.stringify(model.serialize(model, true));
                    if (checkSum !== modelRec.checkSum)
                        updModels.push(model);
                }
                else
                    newModels.push(model);
            }
        });

        this._dataObjectEngine.saveSchemaToFile("../../upgrader-test/after");

        let errs = [];
        newModels.concat(updModels).forEach(model => {
            schema.checkModelFields(model, errs);
        });
        if (errs.length > 0)
            throw new Error(errs[0].message);

        newModels = await this._fillTypeModel(newModels);
        console.log(newModels);
        await this.createNewBuild(newModels, updModels);
    }
}

async function start () {
    try {
        let upgrader = new Upgrader({ resMan: dbInitObject.resMan, dataObjectEngine: dbInitObject.dataObjectEngine });
        await upgrader.upgrade();
        console.log(buildLogString(`Upgrade has successfully finished.`));
        process.exit(0);
    }
    catch (error) {
        console.error(buildLogString(`ERROR: ${error.message ? error.message : JSON.stringify(error)}`));
        process.exit(1);
    }
};
start();
