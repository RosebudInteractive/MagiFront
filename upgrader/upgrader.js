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

const dbInitObject = new DbEngineInit(magisteryConfig, true);

const { DbUtils } = require('../database/db-utils');
const Meta = require(UCCELLO_CONFIG.uccelloPath + 'metadata/meta-defs');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const Resource = require(UCCELLO_CONFIG.uccelloPath + 'resman/data-types/resource');

const RES_LIST_MSSQL =
    "select t.[Id], t.[ResTypeGuid], t.[ClassName], t.[Description], r.[ResGuid], r.[Name]\n" +
    "from [SysResType] t\n" +
    "  join [SysResource] r on r.[ResTypeId] = t.[Id]\n" +
    "order by t.[Id]";

const RES_LIST_MYSQL =
    "select t.`Id`, t.`ResTypeGuid`, t.`ClassName`, t.`Description`, r.`ResGuid`, r.`Name`\n" +
    "from `SysResType` t\n" +
    "  join `SysResource` r on r.`ResTypeId` = t.`Id`\n" +
    "order by t.`Id`";

const RES_TYPE_MODEL = "SysResType";
const META_MODEL_GUID = UCCELLO_CONFIG.classGuids.MetaModel;
const VMETA_MODEL_GUID = UCCELLO_CONFIG.classGuids.MetaModelVirtual;
const FILE_NAME = "./release-builds/db-upgrade.json";

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
        this._otherRes = {};
        this._resByTypeAndName = {};
        this._resTypes = {};
    }

    async _initOtherResState(db) {
        return this._scanResources(db, [], []);
    }

    async _scanResources(db, updRes, newRes, withCheck) {
        let new_res = [];
        let guids = db.getRootGuids()
        for (let i = 0; i < guids.length; i++) {
            let rootObj = db.getRoot(guids[i]).getRootObj();
            if ((rootObj instanceof Resource) && (rootObj.getTypeGuid() !== META_MODEL_GUID) && 
                (rootObj.getTypeGuid() !== VMETA_MODEL_GUID) && this._resTypes[rootObj.getTypeGuid()]) {
                let md5sum = crypto.createHash('md5');
                md5sum.update(JSON.stringify(rootObj.serialize(true)));
                let checkSum = md5sum.digest('hex');
                let resData = this._otherRes[rootObj.getGuidRes()];
                if (resData) {
                    if (updRes && (resData.checkSum !== checkSum))
                        updRes.push(rootObj);
                }
                else
                    if (newRes)
                        new_res.push(rootObj);
                this._otherRes[rootObj.getGuidRes()] = {
                    obj: rootObj,
                    checkSum: checkSum
                };
            }
        }
        if (withCheck && (new_res.length > 0)) {
            let new_guids = []
            for (let i = 0; i < new_res.length; i++)
                new_guids.push(new_res[i].getGuidRes());
            let oldRes = await this._resMan.getResources(new_guids);
            for (let i = 0; i < new_res.length; i++) {
                let resGuid = new_res[i].getGuidRes();
                if (oldRes[resGuid]) {
                    let md5sum = crypto.createHash('md5');
                    md5sum.update(JSON.stringify(oldRes[resGuid].body));
                    let checkSum = md5sum.digest('hex');
                    if (updRes && (this._otherRes[resGuid].checkSum !== checkSum))
                        updRes.push(new_res[i]);
                }
                else
                    newRes.push(new_res[i]);
            }
        }
        else
            if (newRes)
                Array.prototype.push.apply(newRes, new_res);
    }

    async _initResList() {
        let new_qty = await this._createMissingResTypes();
        let result = await $data.execSql({
            dialect: {
                mysql: _.template(RES_LIST_MYSQL)({}),
                mssql: _.template(RES_LIST_MSSQL)({})
            }
        }, {});
        if (result && result.detail && (result.detail.length > 0)) {
            let currTpGuid = "";
            let currTp = null;
            result.detail.forEach(elem => {
                if (currTpGuid !== elem.ResTypeGuid) {
                    currTpGuid = elem.ResTypeGuid;
                    this._resByTypeAndName[currTpGuid] = currTp = {};
                }
                currTp[elem.Name] = elem.ResGuid;
            });
        }
        return new_qty;
    }

    async _createMissingResTypes() {

        let options = { dbRoots: [] };
        let root_obj;
        let db = $memDataBase;

        return await Utils.editDataWrapper(() => {
            return new MemDbPromise(db, resolve => {
                let exp = { expr: { model: { name: RES_TYPE_MODEL, } } };
                resolve(db.getData(Utils.guid(), null, null, exp, {}));
            })
                .then(async (result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("Invalid result of \"getData\": " + JSON.stringify(result));

                    options.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper

                    await root_obj.edit();
                    let collection = root_obj.getCol("DataElements");
                    for (let i = 0; i < collection.count(); i++){
                        let tpObj = collection.get(i);
                        this._resTypes[tpObj.resTypeGuid()] = {
                            Id: tpObj.id(),
                            ClassName: tpObj.get("ClassName"),
                            Description: tpObj.description()
                        };
                    }
                    let new_types_cnt = 0;
                    if (UCCELLO_CONFIG.resourceBuilder && UCCELLO_CONFIG.resourceBuilder.types)
                        for (let i = 0; i < UCCELLO_CONFIG.resourceBuilder.types.length; i++) {
                            let tp = UCCELLO_CONFIG.resourceBuilder.types[i];
                            let typeGuid = UCCELLO_CONFIG.classGuids[tp.ClassName];
                            if (!typeGuid)
                                throw new Error(`Unknown resource type: ${typeGuid}`);
                            if (!this._resTypes[typeGuid]) {
                                let newHandler = await root_obj.newObject({
                                    fields: {
                                        Code: tp.Code,
                                        Name: tp.Name,
                                        ClassName: tp.ClassName,
                                        Description: tp.Description,
                                        ResTypeGuid: typeGuid
                                    }
                                }, {});
                                this._resTypes[typeGuid] = {
                                    Id: newHandler.keyValue,
                                    ClassName: tp.ClassName,
                                    Description: tp.Description
                                };
                                new_types_cnt++;
                            }
                        };
                    
                    await root_obj.save();
                    if (this._resTypes[META_MODEL_GUID] && (!this._resTypes[VMETA_MODEL_GUID]))
                        this._resTypes[VMETA_MODEL_GUID] = this._resTypes[META_MODEL_GUID];
                    return new_types_cnt;
                })
        }, options);
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
                        if (!model.isVirtual()) {
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
                        }
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

    async _createNewBuild(newResources, updResources) {
        await this._resMan.createNewBuild();
        for (let i = 0; i < newResources.length; i++){
            let resource = newResources[i];
            let resGuid = resource.getGuidRes();
            let resTypeGuid = resource.getTypeGuid();
            let resTypeId = this._resTypes[resTypeGuid] ? this._resTypes[resTypeGuid].Id : null;
            if (!resTypeId)
                throw new Error(`Unknown resource type: "${resTypeGuid}"`);
            let resBody = JSON.stringify(resource.serialize(true));
            let resInfo = {
                name: resource.resName(),
                code: resource.resName().toUpperCase(),
                description: `${this._resTypes[resTypeGuid].Description} ${resource.resName()}.`,
                resGuid: resGuid,
                resTypeId: resTypeId
            }
            await this._resMan.createNewResource(resInfo);
            await this._resMan.newResourceVersion(resGuid, resBody);
            if (!this._resByTypeAndName[resTypeGuid])
                this._resByTypeAndName[resTypeGuid] = {};
            this._resByTypeAndName[resTypeGuid][resource.resName()] = resGuid;
        }
        for (let i = 0; i < updResources.length; i++) {
            let resource = updResources[i];
            let resGuid = resource.getGuidRes();
            let resBody = JSON.stringify(resource.serialize(true));
            await this._resMan.newResourceVersion(resGuid, resBody);
        }
        await this._resMan.commitBuild();
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

    async _createModelLinksInDb(query, schema, model) {
        let links = schema.outgoingDbRefsLinks(model)[model.name()];
        if (links) {
            for (let link in links)
                await query.createLink(links[link]);
        }
    }

    async _createNewModelsInDb(schema, models) {
        let query = this._dataObjectEngine.getQuery();
        for (let i = 0; i < models.length; i++)
            await query.createTable(models[i]);
        for (let i = 0; i < models.length; i++)
            await this._createModelLinksInDb(query, schema, models[i]);
    }

    async _getObjects(expression, simple_condition, options) {
        let db = $memDataBase;
        return new MemDbPromise(db, (resolve) => {
            if (!expression)
                throw new Error("Upgrader::_getObjects: Invalid parameter \"expression\": " + JSON.stringify(expression));
            let exp_filtered = Object.assign({}, expression);

            if (simple_condition) {
                let predicate = new Predicate(db, {});
                predicate
                    .addCondition(simple_condition);
                exp_filtered.expr.predicate = predicate.serialize(true);
                db._deleteRoot(predicate.getRoot());
            }
            resolve(
                db.getData(Utils.guid(), null, null, exp_filtered, options)
                    .then((result) => {
                        if (result && result.guids && (result.guids.length === 1)) {
                            let obj = db.getObj(result.guids[0]);
                            if (!obj)
                                throw new Error("Upgrader::_getObjects: Object doesn't exist: " + result.guids[0]);
                            return obj;
                        }
                        else
                            throw new Error("Upgrader::_getObjects: Invalid result of \"getData\": " + JSON.stringify(result));
                    })
            );
        });
    }

    async _simpleEditWrapper(expr, simple_condition, processor, options) {
        let opts = options || {};
        let dbOpts = opts.dbOptions || {};
        let memDbOptions = { dbRoots: [] };
        let root_obj = null;
        let db = $memDataBase;

        await Utils.editDataWrapper(() => {
            return new MemDbPromise(db, resolve => {
                resolve(this._getObjects(expr, simple_condition, dbOpts));
            })
                .then((result) => {
                    root_obj = result;
                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(async () => {
                    if (typeof (processor) === "function")
                        await processor(root_obj);
                    await root_obj.save(dbOpts);
                });
        }, memDbOptions);
    }

    jsonToResource(data) {
        let db = this._dataObjectEngine.getDB();
        return db.addMasterRoot(data, {}).getRootObj();
    }

    async getResByName(res_name, class_guid) {
        let db = this._dataObjectEngine.getDB();
        let res = db.findResByName(res_name, class_guid);
        if (!res) {
            let res_type = this._resByTypeAndName[class_guid];
            if (res_type) {
                let res_guid = res_type[res_name];
                if (res_guid) {
                    let res_data = null;
                    try {
                        res_data = await this._resMan.getResource(res_guid);
                    }
                    catch (err) { };
                    if (res_data) {
                        res = db.addMasterRoot(JSON.parse(res_data.body), {}).getRootObj();
                        let md5sum = crypto.createHash('md5');
                        md5sum.update(JSON.stringify(res.serialize(true)));
                        let checkSum = md5sum.digest('hex');
                        this._otherRes[res.getGuidRes()] = {
                            obj: res,
                            checkSum: checkSum
                        };
                    }
                }
            }            
        }
        return res;
    }

    async _processBuild(schema, buildInfo, buildNum) {

        let curBuild = this._getBuild(buildInfo, buildNum);
        if (!curBuild)
            throw new Error(`Build "${buildInfo.product}.${buildInfo.version}.[${buildNum}]" doesn't exist.`);

        let build_info = { product: buildInfo.product, version: buildInfo.version, buildNum: buildNum };
        if (typeof (curBuild.upgrader)!=="string")
            throw new Error(`Build "${buildInfo.product}.${buildInfo.version}.[${buildNum}]": ` +
                `Invalid or missing upgrade module: "${curBuild.upgrader}"`);
        let modulePath = this._getFilePath(curBuild.upgrader);

        const { upgradeDb, upgradeRes, scriptUpgrade } = require(modulePath);
        if (typeof (upgradeDb) === "function") {
            await upgradeDb(schema, build_info);
            schema.checkSchema();
        }
        else
            console.warn(`WARNING: Build "${buildInfo.product}.${buildInfo.version}.[${buildNum}]": ` +
                `Module "${modulePath}" doesn't implement "upgradeDb" method`);

        if (typeof (upgradeRes) === "function") {
            await upgradeRes({
                schema: schema,
                meta: Meta,
                predicate: Predicate,
                utils: Utils,
                buildInfo: build_info,
                getResByName: this.getResByName.bind(this),
                jsonToResource: this.jsonToResource.bind(this),
                classGuids: UCCELLO_CONFIG.classGuids
            });
        }

        let newModels = [];
        let updModels = [];
        schema.models().forEach(model => {
            if (!model.isTypeModel()) {
                let modelRec = this._models[model.name()];
                let md5sum = crypto.createHash('md5');
                md5sum.update(JSON.stringify(model.serialize(true)));
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

        await this._runScript(buildInfo, buildNum, "script_before");
        newModels = await this._fillTypeModel(newModels); // sorted newModels
        let updRes = [];
        let newRes = [];
        await this._scanResources(this._dataObjectEngine.getDB(), updRes, newRes, true);
        await this._createNewBuild(newModels.concat(newRes), updModels.concat(updRes));
        await this._createNewModelsInDb(schema, newModels);

        await this._runScript(buildInfo, buildNum, "script_upgrade");

        if (typeof (scriptUpgrade) === "function")
            
            await scriptUpgrade({
                engine: this._dataObjectEngine,
                schema: schema,
                db: $memDataBase,
                meta: Meta,
                memDbPromise: MemDbPromise,
                predicate: Predicate,
                utils: Utils,
                buildInfo: build_info,
                simpleEditWrapper: async (expr, simple_condition, processor, options) => { return this._simpleEditWrapper(expr, simple_condition, processor, options)}
            });
        
        await this._runScript(buildInfo, buildNum, "script_after");
    }

    async upgrade() {
        await this._dataObjectEngine.whenIsReady();

        console.log(buildLogString(`READY!`));
        let new_qty = await this._initResList();
        if (new_qty)
            console.log(buildLogString(`New resource types: ${new_qty}.`));
        await this._initOtherResState(this._dataObjectEngine.getDB());

        let schema = this._dataObjectEngine.getSchema();
        schema.models().forEach(model => {
            if (!model.isTypeModel()) {
                let md5sum = crypto.createHash('md5');
                md5sum.update(JSON.stringify(model.serialize(true)));
                let checkSum = md5sum.digest('hex');
                this._models[model.name()] = {
                    model: model,
                    checkSum: checkSum
                };
            };
        });

        let verInfo = await this._resMan.getVersionInfo();
        let builds = Object.keys(this._buildInfo.builds).map((elem => { return parseInt(elem) }))
            .sort((a, b) => { return a > b ? 1 : (a < b ? -1 : 0) });
        if (verInfo.product.Code !== this._buildInfo.product)
            throw new Error(`Current product code "${verInfo.product.Code}" doesn't match upgraded product code "${this._buildInfo.product}".`);
        if (verInfo.version.Code !== this._buildInfo.version)
            throw new Error(`Current version code "${verInfo.version.Code}" doesn't match upgraded version code "${this._buildInfo.version}".`);
        let nextBuildNum = verInfo.build.BuildNum + 1;
        let i = builds.indexOf(nextBuildNum);
        if (i >= 0)
            for (; i < builds.length; nextBuildNum++ , i++) {
                if (builds[i] !== nextBuildNum)
                    throw new Error(`Missing build number: "${nextBuildNum}".`);
                let startTime = new Date();
                console.log(buildLogString(`Start upgrading to "${verInfo.product.Code}" v.${verInfo.version.Code} build ${nextBuildNum}.`));
                await this._processBuild(schema, this._buildInfo, builds[i]);
                console.log(buildLogString(`Finished: "${verInfo.product.Code}" ` +
                    `v.${verInfo.version.Code} build ${nextBuildNum}. Time: ${(((new Date) - startTime) / 1000).toFixed(3)} sec.`));
            };
    }
}

async function start () {
    try {
        let startTime = new Date();
        let fn = config.upgrader && config.upgrader.upgraderFile ? config.upgrader.upgraderFile : FILE_NAME;
        let upgrader = new Upgrader(fn, { resMan: dbInitObject.resMan, dataObjectEngine: dbInitObject.dataObjectEngine });
        await upgrader.upgrade();
        console.log(buildLogString(`Upgrade has successfully finished. Total time: ${(((new Date) - startTime) / 1000).toFixed(3)} sec.`));
        process.exit(0);
    }
    catch (error) {
        console.error(buildLogString(`ERROR: ${error.message ? error.message : JSON.stringify(error)}`));
        process.exit(1);
    }
};

start();
