'use strict'
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const config = require('config');
const passportJWT = require("passport-jwt");
const { HttpCode } = require("../const/http-codes");
const { HttpError } = require('../errors/http-error');
const { UsersCache } = require("./users-cache");
const { AccessRights } = require('./access-rights');
const { GetTokenFromReq, StdLogin, DestroySession } = require('./local-auth');
const { UserRegister } = require("./user-register");
const { TokenType } = require('../const/common');
const DISPOSABLE_TOKEN_EXP = 1000 * 60 * 5; // 5 min

class AuthJWT {

    static genTokenFunc(user, options) {
        return new Promise(resolve => {
            let opts = _.cloneDeep(options || {});
            let sign_opts = opts.sign || {};
            delete opts.sign;
            let payload = { id: user.Id };
            let token = jwt.sign(payload, getAuthJWTInit()._jwtOptions.secretOrKey, sign_opts);
            let rc = getAuthJWTInit()._usersCache.checkToken("JWT " + token, true, opts)
                .then(() => { return token });
            resolve(rc);
        });
    }

    constructor() {
        const ExtractJwt = passportJWT.ExtractJwt;

        this._jwtOptions = {}
        // this._jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
        this._jwtOptions.jwtFromRequest = ExtractJwt.fromExtractors([
            ExtractJwt.fromAuthHeaderWithScheme('JWT'),
            ExtractJwt.fromUrlQueryParameter('token')
        ]);
        this._jwtOptions.secretOrKey = config.get('authentication.secret');
        
        this._usersCache = UsersCache();
    }
    
    init(app){
        if (!this._initFlag) {
            this._initFlag = true;

            app.get("/api/get-disposable-token", async (req, res) => {
                if (req.user) {
                    try {
                        let token = await AuthJWT.genTokenFunc(req.user, {
                            type: TokenType.Disposable,
                            expTime: DISPOSABLE_TOKEN_EXP,
                            sign: { expiresIn: `${DISPOSABLE_TOKEN_EXP}ms` }
                        });
                        res.json({ token: token });
                    }
                    catch (err) {
                        res.status(err instanceof HttpError ? err.statusCode : HttpCode.ERR_INTERNAL)
                            .json({ message: err.message });
                    }
                }
                else
                    res.status(HttpCode.ERR_UNAUTH).json({ message: "Unauthorized." });
            });

            const JwtStrategy = passportJWT.Strategy;
            const strategy = new JwtStrategy(this._jwtOptions,
                ((jwt_payload, next) => {
                    // console.log('payload received', jwt_payload);
                    var user = this._usersCache.getUserInfoById(jwt_payload.id)
                        .then((result) => {
                            next(null, result ? result : false);
                        })
                        .catch((err) => {
                            next(err);
                        });
                }).bind(this));

            passport.use(strategy);

            app.post("/api/app-register", (req, res) => {
                new Promise(resolve => {
                    let data =
                    {
                        Login: req.body.login,
                        Name: (req.body.name && (req.body.name.trim().length > 0)) ? req.body.name.trim() : req.body.login
                    };
                    let password = req.body.password;
                    let rc = UserRegister(password, data, this._usersCache)
                        .then((user) => {
                            StdLogin(req, res, user, { message: "User Register: Unknown error." }, null, AuthJWT.genTokenFunc);
                        });
                    resolve(rc);
                })
                    .catch((err) => {
                        if (err instanceof HttpError)
                            res.status(err.statusCode).json(err.errObject)
                        else
                            res.status(HttpCode.ERR_BAD_REQ).json({ message: (err && err.message) ? err.message : JSON.stringify(err) });
                    });
            });

            app.post("/api/jwtlogin",
                ((req, res) => {
                    if (req.body && req.body.login && req.body.password) {
                        let login = req.body.login;
                        let password = req.body.password;
                        let promise = Promise.resolve();
                        promise.
                            then(() => {
                                return DestroySession(req);
                            })
                            .then(() => {
                                return this._usersCache.authUser(login, password);
                            })
                            .then((user) => {
                                AuthJWT.genTokenFunc(user)
                                    .then(token => {
                                        res.json({ user: this._usersCache.userToClientJSON(user), token: token });
                                    })
                                    .catch((err) => {
                                        res.status(HttpCode.ERR_INTERNAL).json({ message: err.toString() });
                                    });
                            })
                            .catch((err) => {
                                res.status(HttpCode.ERR_UNAUTH).json({ message: "Неправильный email или пароль." });
                            });
                    }
                    else
                        res.status(HttpCode.ERR_UNAUTH).json({ message: "Неправильный email или пароль." });
                }).bind(this));
        }
    }

    checkToken(token) {
        return this._usersCache.checkToken(token);
    }

    destroyToken(token) {
        return this._usersCache.destroyToken(token);
    }
};

const isFeatureEnabled = config.get('authentication.enabled');
let authJWT = null;

let getAuthJWTInit = () => {
    if (!authJWT)
        authJWT = new AuthJWT();
    return authJWT;
};

let AuthJWTInit = (app) => {
    if (isFeatureEnabled)
        getAuthJWTInit().init(app);
};

let processAuth = (user, isAuthRequired, accessRights, res, next, info) => {
    if (isAuthRequired) {
        if (user) {
            if (accessRights) {
                let userRights = AccessRights.checkPermissions(user, accessRights)
                if (userRights !== accessRights)
                    return res.status(HttpCode.ERR_FORBIDDEN).json(info ? info : { message: "Access denied." });
            }
        }
        else
            return res.status(HttpCode.ERR_UNAUTH).json(info ? info : { message: "Authorization required" });
    }
    next();
}

exports.AuthJWTInit = AuthJWTInit;
exports.GenTokenFunc = AuthJWT.genTokenFunc;
exports.AuthenticateJWT = (app, isAuthRequired, accessRights) => {
    AuthJWTInit(app);
    return (req, res, next) => {
        if (!isFeatureEnabled) { return next(); }
        let token = GetTokenFromReq(req);
        if ((!token) && req.user)
            return processAuth(req.user, isAuthRequired, accessRights, res, next);
        if (req.jwtResult)
            return processAuth(req.user, isAuthRequired, accessRights, res, next, req.jwtResult.info);
        req.jwtResult = { isSuccess: false };
        if (token)
            passport.authenticate('jwt', function (err, user, info) {
                delete req.user;
                req.jwtResult.info = { message: info && info.message ? info.message : JSON.stringify(info) };
                if (err & isAuthRequired) { return next(err); }
                if ((!user) && isAuthRequired) { return res.status(HttpCode.ERR_UNAUTH).json(req.jwtResult.info); }
                if (!err && user)
                    authJWT.checkToken(token)
                        .then(async (result) => {
                            if (result) {
                                req.jwtResult.isSuccess = true;
                                //
                                // Most likely we don't need to invoke "req.logIn" here, because it'll authorize cookie,
                                //   but we are using JWT here, so lets keep cookie unathorized, just assign "user" to "req.user"
                                //
                                // Meanwhile disposable token will authorize cookie
                                //
                                if (result === TokenType.Disposable) {
                                    await new Promise((resolve, reject) => {
                                        req.logIn(user, err => {
                                            if (err)
                                                reject(err)
                                            else
                                                resolve();
                                        });
                                    })
                                    await authJWT.destroyToken(token);
                                    req.authTokenDisposed = true; // Mark that token has been disposed
                                }
                                else
                                    req.user = user;
                                processAuth(req.user, isAuthRequired, accessRights, res, next);
                            }
                            else {
                                req.jwtResult.info = { message: "Token expired or invalid!" };
                                if (isAuthRequired)
                                    res.status(HttpCode.ERR_UNAUTH).json(req.jwtResult.info)
                                else
                                    next();
                            }
                        })
                        .catch((err) => {
                            res.status(HttpCode.ERR_INTERNAL)
                                .json({ message: err.toString() });
                        })
                else
                    next();
            })(req, res, next)
        else {
            req.jwtResult.info = { message: "Not authorized." };
            if (isAuthRequired)
                res.status(HttpCode.ERR_UNAUTH).json(req.jwtResult.info)
            else
                next();
        }
    };
};