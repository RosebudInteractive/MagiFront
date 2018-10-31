'use strict'
const jwt = require('jsonwebtoken');
const passport = require("passport");
const config = require('config');
const passportJWT = require("passport-jwt");
const { HttpCode } = require("../const/http-codes");
const { UsersCache } = require("./users-cache");
const { AccessRights } = require('./access-rights');
const { DestroySession } = require('./local-auth');

class AuthJWT {

    constructor(app) {
        const ExtractJwt = passportJWT.ExtractJwt;
        const JwtStrategy = passportJWT.Strategy;

        const jwtOptions = {}
        jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
        jwtOptions.secretOrKey = config.get('authentication.secret');
        
        this._usersCache = UsersCache();
        
        const strategy = new JwtStrategy(jwtOptions,
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
                            let payload = { id: user.Id };
                            let token = jwt.sign(payload, jwtOptions.secretOrKey);
                            this._usersCache.checkToken("JWT " + token, true)
                                .then((result) => {
                                    res.json({ user: this._usersCache.userToClientJSON(user), token: token });
                                })
                                .catch((err) => {
                                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.toString() });
                                });
                        })
                        .catch((err) => {
                            res.status(HttpCode.ERR_UNAUTH).json({ message: "Invalid user name or password" });
                        });
                }
                else
                    res.status(HttpCode.ERR_UNAUTH).json({ message: "Invalid user name or password" });
            }).bind(this));
    }

    checkToken(token) {
        return this._usersCache.checkToken(token);
    }
};

const isFeatureEnabled = config.get('authentication.enabled');
let authJWT = null;

let AuthJWTInit = (app) => {
    if ((!authJWT) && isFeatureEnabled)
        authJWT = new AuthJWT(app);
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

exports.AuthenticateJWT = (app, isAuthRequired, accessRights) => {
    AuthJWTInit(app);
    return (req, res, next) => {
        if (!isFeatureEnabled) { return next(); }
        if (req.user)
            return processAuth(req.user, isAuthRequired, accessRights, res, next);
        if (req.jwtResult)
            return processAuth(req.user, isAuthRequired, accessRights, res, next, req.jwtResult.info);
        req.jwtResult = { isSuccess: false };
        let token = req.headers["authorization"];
        if (token)
            passport.authenticate('jwt', function (err, user, info) {
                req.jwtResult.info = info;
                if (err & isAuthRequired) { return next(err); }
                if ((!user) && isAuthRequired) { return res.status(HttpCode.ERR_UNAUTH).json(info); }
                if (!err && user)
                    authJWT.checkToken(token)
                        .then((result) => {
                            if (result) {
                                req.jwtResult.isSuccess = true;
                                //
                                // Most likely we don't need to invoke "req.logIn" here, because it'll authorize cookie,
                                //   but we are using JWT here, so lets keep cookie unathorized, just assign "user" to "req.user"
                                //
                                req.user = user;
                                processAuth(req.user, isAuthRequired, accessRights, res, next);
                                // req.logIn(user, (err) => {
                                //     if (err) {
                                //         return res.status(HttpCode.ERR_INTERNAL).json(
                                //             {
                                //                 message: err instanceof Error ? err.message : err.toString()
                                //             });
                                //     }
                                //     next();
                                // });
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