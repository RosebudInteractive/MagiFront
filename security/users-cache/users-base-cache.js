'use strict'
const _ = require('lodash');
const config = require('config');
const randomstring = require('randomstring');
const hasher = require('wordpress-hash-node');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const { ACCOUNT_ID } = require('../../const/sql-req-common');
const { UserLoginError } = require("../errors");
const { DbObject } = require('../../database/db-object');

const TOKEN_EXP_TIME = 24 * 3600 * 1000;
const TOKEN_UPD_TIME = 1 * 3600 * 1000;
const USER_UPD_TIME = (1 * 3600 + 15 * 60) * 1000;
const LOGIN_FIELD = "Email";

const STATUS_ACTIVE = 1;
const STATUS_PENDING = 2;

const SubsExtPeriod = config.has("billing.subsExtPeriod") ? config.get("billing.subsExtPeriod") : null;
const TokenExpTime = config.has("authentication.tokenExpTime") ? config.get("authentication.tokenExpTime") : TOKEN_EXP_TIME;
const TokenUpdTime = config.has("authentication.tokenUpdTime") ? config.get("authentication.tokenUpdTime") : TOKEN_UPD_TIME;

const USER_FIELDS = ["Id", "Name", "DisplayName", "Email", "PData", "SubsExpDate", "SubsAutoPay", "SubsAutoPayId", "SubsProductId"];
const CONV_USER_DATA_FN = (rawUser) => {
    rawUser.SubsExpDateExt = null;
    if (rawUser.SubsExpDate) {
        rawUser.SubsExpDateExt = new Date(rawUser.SubsExpDate);
        if (SubsExtPeriod)
            rawUser.SubsExpDateExt.setHours(rawUser.SubsExpDate.getHours() + SubsExtPeriod);
    }
    if (typeof (rawUser.PData) === "string") {
        try {
            rawUser.PData = JSON.parse(rawUser.PData);
        }
        catch (e) { rawUser.PData = {}; }
    }
    return rawUser;
};

const ALLOWED_TO_EDIT = {
    "Name": true,
    "DisplayName": true,
    "SubsExpDate": true,
    "SubsAutoPay": true,
    "SubsAutoPayId": true,
    "SubsProductId": true
}
const GET_SN_PROVIDERS_MSSQL = "select [Id], [Code], [Name], [URL] from [SNetProvider]";
const GET_ROLES_MSSQL = "select [Id], [Code], [Name], [ShortCode]  from [Role]";
const GET_SN_PROFILE_MSSQL =
    "select[UserId] from [SNetProfile]\n" +
    "where [ProviderId] = <%= providerId %> and [Identifier] = '<%= identifier %>'";

const GET_SN_PROVIDERS_MYSQL = "select `Id`, `Code`, `Name`, `URL` from `SNetProvider`";
const GET_ROLES_MYSQL = "select `Id`, `Code`, `Name`, `ShortCode`  from `Role`";
const GET_SN_PROFILE_MYSQL =
    "select`UserId` from `SNetProfile`\n" +
    "where `ProviderId` = <%= providerId %> and `Identifier` = '<%= identifier %>'";

const USER_USERROLE_EXPRESSION = {
    expr: {
        model: {
            name: "User",
            childs: [
                {
                    dataObject: {
                        name: "UserRole"
                    }
                }
            ]
        }
    }
};

exports.UsersBaseCache = class UsersBaseCache extends DbObject{

    static UserToClientJSON(user) {
        return {
            Id: user.Id,
            Name: user.Name,
            DisplayName: user.DisplayName,
            SubsExpDate: user.SubsExpDate,
            SubsExpDateExt: user.SubsExpDateExt ? user.SubsExpDateExt : user.SubsExpDate,
            PData: user.PData
        };
    }

    constructor(opts) {
        super(opts);
        let options = opts || {};
        this._loginField = options.loginField || LOGIN_FIELD;
        this._userFields = options.userFields || USER_FIELDS;
        this._tokenExpTime = options.tokenExpTime ? options.tokenExpTime : TokenExpTime;
        this._tokenUpdTime = options.tokenUpdTime ? options.tokenUpdTime : TokenUpdTime;
        this._userUpdTime = options.userUpdTime ? options.userUpdTime : USER_UPD_TIME;
        this._convUserDataFn = typeof (options.convUserDataFn) === "function" ? options.convUserDataFn : CONV_USER_DATA_FN;
        this._afterUserCreateEvent = null;
        this._sNProviders = null;
        this._roles = null;
        this._rolesById = null;
    }

    setAfterUserCreateEvent(func) {
        if (typeof (func) !== "function")
            throw new Error(`UsersBaseCache::setAfterUserCreateEvent: Incorrect argument "fun" type: "${typeof (func)}".`);
        this._afterUserCreateEvent = func;
    }

    userToClientJSON(user) {
        return UsersBaseCache.UserToClientJSON(user);
    }

    getSNProviderByCode(code) {
        return new Promise((resolve, reject) => {
            if (this._sNProviders)
                resolve(this._sNProviders[code])
            else {
                let result =
                    $data.execSql({
                        dialect: {
                            mysql: GET_SN_PROVIDERS_MYSQL,
                            mssql: GET_SN_PROVIDERS_MSSQL
                        }
                    }, {})
                        .then((result) => {
                            let provider = null;
                            if (result && result.detail && (result.detail.length > 0)) {
                                this._sNProviders = {};
                                result.detail.forEach((elem) => {
                                    this._sNProviders[elem.Code] = elem;
                                });
                                provider = (provider = this._sNProviders[code]) ? provider : null;
                            }
                            return provider;
                        });
                resolve(result);
            }
        });
    }

    _loadRoles() {
        return new Promise((resolve, reject) => {
            let result =
                $data.execSql({
                    dialect: {
                        mysql: GET_ROLES_MYSQL,
                        mssql: GET_ROLES_MSSQL
                    }
                }, {})
                    .then((result) => {
                        this._roles = {};
                        this._rolesById = {};
                        if (result && result.detail && (result.detail.length > 0)) {
                            result.detail.forEach((elem) => {
                                this._roles[elem.ShortCode] = elem;
                                this._rolesById[elem.Id] = elem;
                            });
                        }
                    });
            resolve(result);
        });
    }

    getRoleByCode(code) {
        return new Promise((resolve, reject) => {
            let res = Promise.resolve();
            if (!this._roles)
                res = this._loadRoles();
            resolve(res.then(() => { return this._roles[code] }));
        });
    }

    getRoleById(id) {
        return new Promise((resolve, reject) => {
            let res = Promise.resolve();
            if (!this._rolesById)
                res = this._loadRoles();
            resolve(res.then(() => { return this._rolesById[id] }));
        });
    }

    _activateUser(user) {
        return new Promise((resolve) => {
            resolve(this._loadRoles());
        })
            .then(() => {
                user.expDate(null);
                user.activationKey(null);
                user.status(user.status() & (~STATUS_PENDING));

                let PData = JSON.parse(user.pData());
                PData.roles = PData.roles || {};
                delete PData.roles["p"];
                PData.roles["s"] = 1;
                user.pData(JSON.stringify(PData));

                let root_role = user.getDataRoot("UserRole");
                let col_role = root_role.getCol("DataElements");
                let p_obj = null;
                let s_obj = null;
                for (let i = 0; i < col_role.count(); i++) {
                    let obj = col_role.get(i);
                    let role = this._rolesById[obj.roleId()];
                    switch (role.ShortCode) {
                        case "p":
                            p_obj = obj;
                            break;

                        case "s":
                            s_obj = obj;
                            break;
                    }
                }
                if (p_obj)
                    col_role._del(p_obj);

                if (!s_obj) {
                    let role = this._roles["s"];
                    return root_role.newObject({ fields: { AccountId: ACCOUNT_ID, RoleId: role.Id } }, {});
                }
            });
    }

    activateUser(activationKey) {
        let options = { dbRoots: [] };
        let root_obj;
        let user = null;

        return Utils.editDataWrapper((() => {
            return new MemDbPromise(this._db, ((resolve, reject) => {

                if (typeof (activationKey) !== "string")
                    throw new Error("UsersBaseCache::activateUser: Incorrect argument \"activationKey\".");

                var predicate = new Predicate(this._db, {});
                predicate
                    .addCondition({ field: "ActivationKey", op: "=", value: activationKey });


                let exp_filtered = Object.assign({}, USER_USERROLE_EXPRESSION);
                exp_filtered.expr.predicate = predicate.serialize(true);
                this._db._deleteRoot(predicate.getRoot());

                resolve(this._db.getData(Utils.guid(), null, null, exp_filtered, {}));
            }).bind(this))
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = this._db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("UsersBaseCache::activateUser: Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("UsersBaseCache::activateUser: Invalid result of \"getData\": " + JSON.stringify(result));

                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() == 1)
                        user = collection.get(0);
                    if (collection.count() > 1)
                        throw new Error("UsersBaseCache::getUserByEmailOrCreate: Duplicate activationKey: \"" + activationKey + "\" in \"User\" table.");
                    
                    options.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    if (user) {
                        let delta = user.expDate() - (new Date());
                        if (delta > 0) {
                            return this._activateUser(user);
                        }
                        else {
                            // Registration period has expired - delete User
                            root_obj.getCol("DataElements")._del(user);
                        }
                    }
                })
                .then(() => {
                    let rc = null;
                    if (user)
                        rc = root_obj.save()
                            .then(() => {
                                return this.getUserInfoById(user.id(), true);
                            });
                    return rc;
                })
        }).bind(this), options);
    }

    createUser(password, data) {
        let options = { dbRoots: [] };
        let root_obj;
        let user = null;
        let PData = { "roles": { "p": 1 }, "isAdmin": false };

        return Utils.editDataWrapper((() => {
            return new MemDbPromise(this._db, ((resolve, reject) => {
                if (!data)
                    throw new Error("UsersBaseCache::createUser: Empty \"data\" argument.");

                if (typeof (data.Login) !== "string")
                    throw new Error("UsersBaseCache::createUser: Incorrect field \"Login\": " + data.Login);
                
                data.Status = data.Status ? data.Status : (STATUS_ACTIVE + STATUS_PENDING);
                data.IsOld = typeof (data.IsOld) === "boolean" ? data.IsOld : false;

                var predicate = new Predicate(this._db, {});
                predicate
                    .addCondition({ field: "Login", op: "=", value: data.Login });


                let exp_filtered = Object.assign({}, USER_USERROLE_EXPRESSION);
                exp_filtered.expr.predicate = predicate.serialize(true);
                this._db._deleteRoot(predicate.getRoot());

                resolve(this._db.getData(Utils.guid(), null, null, exp_filtered, {}));
            }).bind(this))
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = this._db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("UsersBaseCache::createUser: Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("UsersBaseCache::createUser: Invalid result of \"getData\": " + JSON.stringify(result));

                    options.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() > 0)
                        throw new Error("UsersBaseCache::createUser: User with  login: \"" + data.Login + "\" already exists.");

                    // Create new user

                    data.PData = data.PData || PData;
                    PData = data.PData;
                    data.PData = JSON.stringify(data.PData);

                    let fields = data;

                    return $dbUser.getPwdHash(password)
                        .then((hash) => {
                            fields.PwdHash = hash;
                            return root_obj.newObject({ fields: fields }, {});
                        });
                })
                .then((result) => {
                    user = this._db.getObj(result.newObject);
                    if (!user)
                        throw new Error("UsersBaseCache::createUser: Failed to create new user.");

                    let roles = [];
                    if (PData.isAdmin)
                        roles.push("a");
                    if (PData.roles)
                        for (let role in PData.roles)
                            roles.push(role);
                    let root_role = user.getDataRoot("UserRole");
                    if (roles.length > 0)
                        return Utils.seqExec(roles,
                            (code) => {
                                return this.getRoleByCode(code)
                                    .then((role) => {
                                        return root_role.newObject({ fields: { AccountId: ACCOUNT_ID, RoleId: role.Id } }, {});
                                    });
                            });
                })
                .then(() => {
                    return root_obj.save()
                        .then(() => {
                            return this.getUserInfoById(user.id(), true)
                        })
                        .then(result => {
                            if (this._afterUserCreateEvent)
                                return this._afterUserCreateEvent(result);
                            return result;
                        });
                })
        }).bind(this), options);
    }

    userPwdRecovery(user_data) {
        let options = { dbRoots: [] };
        let root_obj;
        let user = null;
        let isRecovery;
        let hasActivationKey = false;
        let activationExpired = false;

        return Utils.editDataWrapper((() => {
            return new MemDbPromise(this._db, ((resolve, reject) => {
                if (!user_data)
                    throw new Error("UsersBaseCache::userPwdRecovery: Empty \"user_data\" argument.");

                if (!user_data.key)
                    throw new Error("UsersBaseCache::userPwdRecovery: Missing \"user_data.key\" argument.");

                let field;
                let value;
                if (typeof (value = user_data.key.Id) === "number")
                    field = "Id"
                else
                    if (typeof (value = user_data.key.Email) === "string")
                        field = "Email"
                    else
                        if (typeof (value = user_data.key.ActivationKey) === "string") {
                            field = "ActivationKey";
                            hasActivationKey = true;
                        }
                        else
                            throw new Error("UsersBaseCache::userPwdRecovery: Invalid arguments: " + JSON.stringify(user_data));

                if (typeof (user_data.ActivationKey) === "string") {
                    isRecovery = true
                    if (!((typeof (user_data.ExpDate) === "object") && (typeof (user_data.ExpDate - 0) === "number")))
                        throw new Error("UsersBaseCache::userPwdRecovery: Invalid argument \"ExpDate\": " + JSON.stringify(user_data.ExpDate));
                }
                else
                    if (typeof (user_data.Password) === "string")
                        isRecovery = false
                    else
                        throw new Error("UsersBaseCache::userPwdRecovery: Invalid arguments: " + JSON.stringify(user_data));
                
                
                var predicate = new Predicate(this._db, {});
                predicate
                    .addCondition({ field: field, op: "=", value: value });

                let exp_filtered = { expr: { model: { name: "User" } } };
                exp_filtered.expr.predicate = predicate.serialize(true);
                this._db._deleteRoot(predicate.getRoot());

                resolve(this._db.getData(Utils.guid(), null, null, exp_filtered, {}));
            }).bind(this))
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = this._db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("UsersBaseCache::userPwdRecovery: Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("UsersBaseCache::userPwdRecovery: Invalid result of \"getData\": " + JSON.stringify(result));

                    options.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        if (hasActivationKey)
                            throw new Error("Activation key has expired.")
                        else
                            throw new Error("UsersBaseCache::userPwdRecovery: User doesn't exist or duplicate.");

                    user = collection.get(0);
                    let rc = Promise.resolve();
                    if (isRecovery) {
                        user.activationKey(user_data.ActivationKey);                  
                        user.expDate(user_data.ExpDate);                  
                    }
                    else {
                        user.activationKey(null);
                        activationExpired = user.expDate() && ((user.expDate() - (new Date())) < 0);
                        user.activationKey(null);
                        user.expDate(null);
                        if (!activationExpired) {
                            user.isOld(false);
                            rc = $dbUser.getPwdHash(user_data.Password)
                                .then((hash) => {
                                    user.pwdHash(hash);
                                });
                        }
                    }
                    return rc.then(() => {
                        return root_obj.save()
                            .then(() => {
                                if (activationExpired)
                                    throw new Error("Activation key has expired.")
                                return this.getUserInfoById(user.id(), true)
                            });
                    });
                })
        }).bind(this), options);
    }

    //
    // Currently we can edit only "Password" and "DisplayName" here
    //
    editUser(id, user_data, options) {
        let memDbOptions = { dbRoots: [] };
        let root_obj;
        let user = null;
        let dbopts = options || {};

        return Utils.editDataWrapper((() => {
            return new MemDbPromise(this._db, ((resolve, reject) => {
                if (!user_data)
                    throw new Error("UsersBaseCache::editUser: Empty \"user_data\" argument.");

                if (!user_data.alter)
                    if (!((typeof (user_data.DisplayName) === "string") ||
                        ((typeof (user_data.Password) === "string") && (typeof (user_data.NewPassword) === "string"))))
                        throw new Error("UsersBaseCache::editUser: Invalid \"user_data\" arguments.");

                let predicate = new Predicate(this._db, {});
                predicate
                    .addCondition({ field: "Id", op: "=", value: id });

                let exp_filtered = { expr: { model: { name: "User" } } };
                exp_filtered.expr.predicate = predicate.serialize(true);
                this._db._deleteRoot(predicate.getRoot());

                resolve(this._db.getData(Utils.guid(), null, null, exp_filtered, {}));
            }).bind(this))
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = this._db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("UsersBaseCache::editUser: Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("UsersBaseCache::editUser: Invalid result of \"getData\": " + JSON.stringify(result));

                    memDbOptions.dbRoots.push(root_obj); // Remember DbRoot to delete it finally in editDataWrapper
                    return root_obj.edit();
                })
                .then(() => {
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() !== 1)
                        throw new Error("UsersBaseCache::editUser: User doesn't exist.");

                    user = collection.get(0);
                    let rc = Promise.resolve();
                    if (user_data.alter) {
                        for (let key in user_data.alter){
                            if (ALLOWED_TO_EDIT[key]) {
                                user[this._genGetterName(key)](user_data.alter[key]);
                            }
                        };
                    }
                    else {
                        if (user_data.DisplayName)
                            user.displayName(user_data.DisplayName);
                        if (user_data.Password)
                            rc = $dbUser.checkPwd(user_data.Password, user.pwdHash())
                                .then((result) => {
                                    if (!result)
                                        throw new Error("UsersBaseCache::editUser: Invalid password!");
                                    if (user_data.NewPassword) {
                                        return $dbUser.getPwdHash(user_data.NewPassword)
                                            .then((hash) => {
                                                user.pwdHash(hash);
                                            })
                                    }
                                });
                    }
                    return rc.then(() => {
                        return root_obj.save(dbopts)
                            .then(() => {
                                return this.getUserInfoById(user.id(), true)
                            });
                    });
                })
        }).bind(this), memDbOptions);
    }

    getUserByProfile(profile) {

        let providerId;
        let isNewUser = false;

        let getUserByEmailOrCreate = ((email, profile) => {

            let root_obj;
            let user = null;

            return new MemDbPromise(this._db, ((resolve, reject) => {
                var predicate = new Predicate(this._db, {});
                predicate
                    .addCondition({ field: "Email", op: "=", value: email });
                let exp =
                    {
                        expr: {
                            model: {
                                name: "User",
                                childs: [
                                    {
                                        dataObject: {
                                            name: "SNetProfile"
                                        }
                                    },
                                    {
                                        dataObject: {
                                            name: "UserRole"
                                        }
                                    }
                                ]
                            },
                            predicate: predicate.serialize(true)
                        }
                    };
                this._db._deleteRoot(predicate.getRoot());
                resolve(this._db.getData(Utils.guid(), null, null, exp, {}));
            }).bind(this))
                .then((result) => {
                    if (result && result.guids && (result.guids.length === 1)) {
                        root_obj = this._db.getObj(result.guids[0]);
                        if (!root_obj)
                            throw new Error("UsersBaseCache::getUserByEmailOrCreate: Object doesn't exist: " + result.guids[0]);
                    }
                    else
                        throw new Error("UsersBaseCache::getUserByEmailOrCreate: Invalid result of \"getData\": " + JSON.stringify(result));

                    return root_obj.edit();
                })
                .then(() => {
                    let collection = root_obj.getCol("DataElements");
                    if (collection.count() > 1)
                        throw new Error("UsersBaseCache::getUserByEmailOrCreate: Duplicate email: \"" + email + "\" in \"User\" table.");

                    if (collection.count() == 1) {
                        // We've found user by email
                        user = collection.get(0);
                        if (user.expDate())
                            return this._activateUser(user); // User is pending for activation, therefore let's activate his
                    }
                    else {
                        // Create new user
                        isNewUser = true;
                        let fields = {
                            Name: profile.username,
                            DisplayName: profile.displayName,
                            Login: email,
                            Email: email,
                            URL: profile.profileUrl,
                            RegDate: new Date(),
                            Status: STATUS_ACTIVE,
                            IsOld: false,
                            PData: JSON.stringify({ isAdmin: false, roles: { s: 1 } }) // Role: "subscriber"
                        };
                    
                        return $dbUser.getPwdHash(randomstring.generate(15))
                            .then((hash) => {
                                fields.PwdHash = hash;

                                return root_obj.newObject({ fields: fields }, {})
                                    .then((result) => {
                                        user = this._db.getObj(result.newObject);
                                        if (!user)
                                            throw new Error("UsersBaseCache::getUserByEmailOrCreate: Failed to create new user.");
                                        return this.getRoleByCode("s");
                                    })
                                    .then((role) => {
                                        let root_role = user.getDataRoot("UserRole");
                                        return root_role.newObject({ fields: { AccountId: ACCOUNT_ID, RoleId: role.Id } }, {});
                                    });
                            });
                    }
                })
                .then(() => {
                    let root_profile = user.getDataRoot("SNetProfile");
                    let collection = root_profile.getCol("DataElements");
                    let curr_prof = null;
                    for (let i = 0; i < collection.count(); i++) {
                        let prof = collection.get(i);
                        if (prof.providerId() === providerId) {
                            if (prof.identifier() === profile.identifier) {
                                curr_prof = prof;
                                break;
                            }
                            else {
                                if (prof.isOld() && (!prof.isUpdated())) {
                                    prof.identifier(profile.identifier);
                                    prof.isUpdated(true);
                                    return root_obj.save();
                                }
                                else
                                    throw new Error("UsersBaseCache::getUserByEmailOrCreate: Conflicting values of \"email\" and \"identifier\".");
                            }
                        }
                    }
                    if (!curr_prof) {
                        let fields = {
                            ProviderId: providerId,
                            Identifier: profile.identifier,
                            Email: email,
                            URL: profile.profileUrl,
                            DisplayName: profile.displayName,
                            Description: profile.description,
                            FirstName: profile.firstName,
                            LastName: profile.lastName,
                            Gender: profile.gender,
                            Age: profile.age,
                            DayOfBirth: profile.dayOfBirth,
                            MonthOfBirth: profile.monthOfBirth,
                            YearOfBirth: profile.yearOfBirth,
                            Phone: profile.phone,
                            Address: profile.address,
                            Country: profile.country,
                            City: profile.city,
                            Zip: profile.zip,
                            IsOld: false,
                            IsUpdated: false
                        }
                        if (profile.photos && (profile.photos.length > 0) && profile.photos[0].value)
                            fields.PhotoUrl = profile.photos[0].value;
                        return root_profile.newObject({ fields: fields }, {})
                            .then(() => {
                                return root_obj.save();
                            });
                    }
                })
                .finally((isErr, res) => {
                    if (root_obj)
                        this._db._deleteRoot(root_obj.getRoot());
                    if (isErr) {
                        throw res;
                    }
                    return this.getUserInfoById(user.id(), true);
                })
                .then(result => {
                    if (isNewUser && this._afterUserCreateEvent)
                        return this._afterUserCreateEvent(result);
                    return result;
                });
        }).bind(this);

        return new Promise((resolve, reject) => {
            if (!profile)
                throw new Error("User profile is empty.");
            resolve(this.getSNProviderByCode(profile.provider));
        })
            .then((provider) => {
                if (provider) {
                    providerId = provider.Id;
                    return $data.execSql({
                        dialect: {
                            mysql: _.template(GET_SN_PROFILE_MYSQL)({ providerId: providerId, identifier: profile.identifier }),
                            mssql: _.template(GET_SN_PROFILE_MSSQL)({ providerId: providerId, identifier: profile.identifier })
                        }
                    }, {})
                }
                else
                    throw new Error("Unknown provider \"" + profile.provider + "\".");
            })
            .then((result) => { 
                if (result && result.detail && (result.detail.length === 1) && result.detail[0].UserId) {
                    return this.getUserInfoById(result.detail[0].UserId, true);
                }
                else
                    if (profile.emails && (profile.emails.length > 0) && profile.emails[0].value)
                        return getUserByEmailOrCreate(profile.emails[0].value, profile)
                    else
                        throw new Error(profile.displayName + ", EMAIL is required.");
            });
    }

    authUser(login, password) {

        function verifyUser(user) {
            return new Promise((resolve, reject) => {
                let result = Promise.resolve();
                let root_user = user.getParent();
                if ((user.status() & STATUS_ACTIVE) === 0)
                    throw new UserLoginError(UserLoginError.REG_BLOCKED);
                if (user.isOld()) {
                    let checked = hasher.CheckPassword(password, user.pwdHashOld());
                    if (!checked)
                        throw new UserLoginError(UserLoginError.AUTH_FAIL);
                    result = root_user.edit()
                        .then(() => {
                            return $dbUser.getPwdHash(password)
                                .then((hash) => {
                                    user.pwdHash(hash);
                                    user.isOld(false);
                                    return root_user.save();
                                });
                        })
                        .then(() => {
                            return ({ checked: true });
                        })
                }
                else
                    if ((user.status() & STATUS_PENDING) !== 0)
                        if (user.expDate()) {
                            let delta = user.expDate() - (new Date());
                            if (delta < 0) {
                                result = root_user.edit()
                                    .then(() => {
                                        root_user.getCol("DataElements")._del(user);
                                        return root_user.save();
                                    })
                                    .then(() => {
                                        throw new UserLoginError(UserLoginError.REG_EXPIRED);
                                    });
                            }
                        }
                resolve(result);
            });
        }

        return $dbUser.checkUser(login, password,
            {
                fields: this._userFields,
                model: $dbUser.getModelName(),
                loginField: this._loginField,
                verifyUserFn: verifyUser,
                errorClass: UserLoginError
            })
            .then(((result) => {
                let res = this._convUserDataFn ? this._convUserDataFn(result.fields) : result.fields;
                return this._storeUser(res);
            }).bind(this));
    }

    getUserInfoById(id, isRenew) {
        return new Promise((resolve) => { resolve(isRenew ? null : this._getUser(id)) })
            .then((user) => {
                if (!user)
                    user = $dbUser.getUser(id, this._userFields)
                        .then(((result) => {
                            let rc = result;
                            if (result) {
                                let res = this._convUserDataFn ? this._convUserDataFn(result) : result;
                                rc = this._storeUser(res);
                            }
                            return rc;
                        }).bind(this));
                return user;
            });
    }

    getUserInfo(condition, isClient, fields) {
        return $dbUser.getUser(condition, fields || this._userFields)
            .then(((result) => {
                let rc = result;
                if (result) {
                    rc = this._convUserDataFn ? this._convUserDataFn(result) : result;
                    if (isClient)
                        rc = this.userToClientJSON(rc);
                }
                return rc;
            }).bind(this));
    }

    checkToken(token, isNew) {
        return this._checkToken(token, isNew);
    }

    destroyToken(token) {
        return this._destroyToken(token);
    }

    _storeUser(user) {
        Promise.reject(new Error("UsersBaseCache::_storeUser should be implemented in descendant."));
    }

    _getUser(id) {
        Promise.reject(new Error("UsersBaseCache::_getUser should be implemented in descendant."));
    }

    _checkToken(token, isNew) {
        Promise.reject(new Error("UsersBaseCache::_checkToken should be implemented in descendant."));
    }

    _destroyToken(token) {
        Promise.reject(new Error("UsersBaseCache::_destroyToken should be implemented in descendant."));
    }
}
