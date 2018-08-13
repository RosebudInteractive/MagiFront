'use strict'
const _ = require('lodash');
const config = require('config');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const { HttpCode } = require("../../const/http-codes");
const { UsersMemCache } = require("../../security/users-mem-cache");
const { UsersRedisCache } = require("../../security/users-redis-cache");

function setUserSubsExpDate(id, subExpDate) {

    let options = { dbRoots: [] };
    let root_obj;
    let user = null;
    let db = $memDataBase;

    return Utils.editDataWrapper(() => {
        return new MemDbPromise(db, (resolve, reject) => {
            var predicate = new Predicate(db, {});
            predicate
                .addCondition({ field: "Id", op: "=", value: id });
            let exp =
                {
                    expr: {
                        model: {
                            name: "User",
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
                let collection = root_obj.getCol("DataElements");
                if (collection.count() == 1) {
                    // We've found user by ID
                    user = collection.get(0);
                    user.subsExpDate(subExpDate);
                    return root_obj.save();
                }
                else
                    throw new Error("User ID: \"" + id + "\" doesn't exist.");
            });
    }, options);
}

exports.SetupRoute = (app) => {

    if (config.get('debug.routes.set-user-subscription')) {

        let usersCache = null;

        app.get("/api/set-user-subscription/:date", (req, res, next) => {
            new Promise((resolve, reject) => {
                if(!req.user)
                    throw new Error(`Unauthorized user.`);
                let ms = Date.parse(req.params.date);
                if (isNaN(ms))
                    throw new Error(`Invalid date format: "${req.params.date}".`);
                if (!usersCache)
                    usersCache = config.get('authentication.storage') === "redis" ? UsersRedisCache() : UsersMemCache(); // UsersMemCache can't be used in cluster mode
                resolve(setUserSubsExpDate(req.user.Id, new Date(ms)));
            })
                .then(() => {
                    return usersCache.getUserInfoById(req.user.Id, true);
                })
                .then((result) => {
                    res.send(usersCache.userToClientJSON(result));
                })
                .catch((err) => {
                    next(err);
                });
        });
    }
};