'use strict';
process.env["NODE_CONFIG_DIR"] = "../config/";
const config = require('config');
const crypto = require('crypto');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { magisteryConfig } = require("../etc/config")
const { buildLogString, getTimeStr } = require('../utils');
const { DbEngineInit } = require("../database/dbengine-init");

const dbInitObject = new DbEngineInit(magisteryConfig);

const { DbUtils } = require('../database/db-utils');
const Meta = require(UCCELLO_CONFIG.uccelloPath + 'metadata/meta-defs');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

class Upgrader{

    constructor(fname, options) {
        if(!fname)
            throw new Error(`Argument "fname" is missing.`);
        this._buildInfo = JSON.parse(fs.readFileSync(fname, { encoding: "utf8" }));
        this._baseDir = path.parse(path.resolve(fname)).dir;
        let opts = options || {};
        if (!(this._resMan = opts.resMan))
            throw new Error(`Argument "resMan" is missing.`);
        if (!(this._dataObjectEngine = opts.dataObjectEngine))
            throw new Error(`Argument "dataObjectEngine" is missing.`);
        this._providerId = this._dataObjectEngine.getProviderId();
        this._models = {};
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

    async _createNewBuild(newModels, updModels) {
        await this._resMan.createNewBuild();
        console.log(`New build has been created.`);
    }

    _getFilePath(fn) {
        return path.isAbsolute(fn) ? fn : path.resolve(path.join(this._baseDir, fn));
    }

    _getBuild(buildInfo, buildNum) {
        return buildInfo.builds && buildInfo.builds[buildNum] ? buildInfo.builds[buildNum] : null;
    }

    async _runScript(buildInfo, buildNum, scriptTag) {
        let curBuild = this._getBuild(buildInfo, buildNum);
        let scriptFile = curBuild[scriptTag];
        if (scriptFile) {
            if (typeof (scriptFile) !== "string") {
                scriptFile = scriptFile[this._providerId];
                if (typeof (scriptFile) !== "string")
                    throw new Error(`Build "${buildInfo.product}.${buildInfo.version}.[${buildNum}]": ` +
                        `Invalif or missing script "${scriptTag}" for provider "${this._providerId}".`);
            }
            scriptFile = this._getFilePath(scriptFile);
            await this._dataObjectEngine.getQuery().execDbScript({}, scriptFile);
        }
    }

    async _processBuild(schema, buildInfo, buildNum) {

        let curBuild = this._getBuild(buildInfo, buildNum);
        if (!curBuild)
            throw new Error(`Build "${buildInfo.product}.${buildInfo.version}.[${buildNum}]" doesn't exist.`);

        await this._runScript(buildInfo, buildNum, "script_before");

        if (typeof (curBuild.upgrader)!=="string")
            throw new Error(`Build "${buildInfo.product}.${buildInfo.version}.[${buildNum}]": ` +
                `Invalid or missing upgrade module: "${curBuild.upgrader}"`);
        let modulePath = this._getFilePath(curBuild.upgrader);

        const { upgradeDb } = require(modulePath);
        if (typeof (upgradeDb) !== "function")
            throw new Error(`Build "${buildInfo.product}.${buildInfo.version}.[${buildNum}]": ` +
                `Module "${modulePath}" doesn't implement "upgradeDb" method`);

        upgradeDb(schema);
        schema.checkSchema();

        let newModels = [];
        let updModels = [];
        schema.models().forEach(model => {
            if ((!model.isTypeModel()) && (!model.isVirtual())) {
                let modelRec = this._models[model.name()];
                let md5sum = crypto.createHash('md5');
                md5sum.update(JSON.stringify(model.serialize(model, true)));
                let checkSum = md5sum.digest('hex');
                if (modelRec) {
                    if (checkSum !== modelRec.checkSum) {
                        updModels.push(model);
                        modelRec.checkSum = checkSum;
                    }
                }
                else {
                    this._models[model.name()] = {
                        model: model,
                        checkSum: checkSum
                    };
                    newModels.push(model);
                }
            }
        });

        let errs = [];
        newModels.concat(updModels).forEach(model => {
            schema.checkModelFields(model, errs);
        });
        if (errs.length > 0)
            throw new Error(errs[0].message);

        newModels = await this._fillTypeModel(newModels);
        console.log(newModels);
        await this._createNewBuild(newModels, updModels);
        await this._runScript(buildInfo, buildNum, "script_upgrade");
        await this._runScript(buildInfo, buildNum, "script_after");
    }
    
    async upgrade() {
        await this._dataObjectEngine.whenIsReady();

        console.log(buildLogString(`READY!`));
        let schema = this._dataObjectEngine.getSchema();

        schema.models().forEach(model => {
            if ((!model.isTypeModel()) && (!model.isVirtual())) {
                let md5sum = crypto.createHash('md5');
                md5sum.update(JSON.stringify(model.serialize(model, true)));
                let checkSum = md5sum.digest('hex');
                this._models[model.name()] = {
                    model: model,
                    checkSum: checkSum
                };
            };
        });

        await this._processBuild(schema, this._buildInfo, 2);
    }
}

async function start () {
    try {
        let fn = config.upgrader && config.upgrader.upgraderFile ? config.upgrader.upgraderFile : null;
        let upgrader = new Upgrader(fn, { resMan: dbInitObject.resMan, dataObjectEngine: dbInitObject.dataObjectEngine });
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
