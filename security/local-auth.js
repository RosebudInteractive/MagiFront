'use strict'
const { URL, URLSearchParams } = require('url');
const _ = require('lodash');
const config = require('config');
const passport = require('passport');
const passportLocal = require('passport-local');
const { HttpCode } = require("../const/http-codes");
const { HttpError } = require('../errors/http-error');
const { UsersCache } = require("./users-cache");
const { UserRegister } = require("./user-register");
const { SendRegMail } = require("./user-register");
const { UserActivate } = require("./user-activate");
const { UserPwdRecovery } = require("./user-pwd-recovery");
const { UserLoginError } = require("./errors");
const { recaptcha } = require('./recaptcha');
const { AccessRights } = require('./access-rights');
const { Activation } = require('../const/activation');
const serialize = require('./serialize');

let usersCache = null;

class AuthLocal {

    static getTokenFromReq(req) { return req.headers["authorization"] || (req.query["token"] ? ("JWT " + req.query["token"]) : null) }

    static destroySession(req) {
        return new Promise(resolve => {
            if (req.session)
                req.session.destroy((err) => {
                    if (err) reject(err)
                    else resolve();
                });
            else
                resolve();
        })
            .then(() => {
                let token = this.getTokenFromReq(req);
                if (token)
                    return usersCache.destroyToken(token);
            });
    }

    static StdLogout(req) {
        return new Promise(resolve => {
            if (req.user && (typeof (req.logOut) === "function"))
                req.logOut();
            resolve();
        })
            .then(() => {
                let token = this.getTokenFromReq(req);
                if (token)
                    return usersCache.destroyToken(token);
            });
    }

    static setupWhoAmI(app) {
        app.get("/api/whoami", (req, res) => {
            if (req.user && usersCache)
                res.json(usersCache.userToClientJSON(req.user))
            else
                res.status(HttpCode.ERR_UNAUTH).json({ message: "Unauthorized." });
        });
    }

    static setupLogOut(app) {
        app.get("/api/logout", (req, res) => {
            this.StdLogout(req)
                .then(() => {
                    res.status(HttpCode.OK).json({ message: "OK" });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                });
        });
    }

    constructor(app) {
        const LocalStrategy = passportLocal.Strategy;
        const localOptions =
            {
                usernameField: 'login',
                passwordField: 'password',
                passReqToCallback: true,
                session: true
            };

        usersCache = this._usersCache = UsersCache();

        serialize(this._usersCache);

        const strategy = new LocalStrategy(localOptions,
            ((req, login, password, done) => {
                this._usersCache.authUser(login, password)
                    .then((user) => {
                        done(null, user);
                    })
                    .catch((err) => {
                        if (err instanceof UserLoginError)
                            done(null, false, err.info)
                        else
                            if (typeof (err) === "string")
                                done(null, false, { message: err })
                            else
                                done(err);
                    });
            }).bind(this));

        passport.use(strategy);

        app.post("/api/login", StdLoginProcessor('local', config.authentication.useCapture));

        app.get("/api/get-activated-user/:activationKey", (req, res) => {
            usersCache.getUserInfo({ field: "ActivationKey", op: "=", value: req.params.activationKey }, true)
                .then((user) => {
                    if (user)
                        res.json(user);
                    else
                        res.status(HttpCode.ERR_NOT_FOUND).json({ message: "Пользователь не найден." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                });
        });

        app.get("/api/activation/:activationKey", (req, res) => {
            UserActivate(req.params.activationKey, this._usersCache)
                .then((user) => {
                    StdLogin(req, res, user, { message: "Период активации истек." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                });
        });

        app.get("/api/recovery/:email", (req, res) => {
            let fromApp = (req.query && req.query.app && ((req.query.app === "true" || (req.query.app === "1")))) ? true : false;
            UserPwdRecovery({ key: { Email: req.params.email } }, this._usersCache, fromApp)
                .then((user) => {
                    let result = fromApp ? { user: user, message: `Вам отправлено письмо на "${req.params.email}"` } : user;
                    res.json(result);
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                });
        });

        app.post("/api/pwdrecovery", (req, res) => {
            chechRecapture(config.authentication.useCapture, req, res, () => {
				let activationKey = req.body.activationKey;
                let password = req.body.password;
                this._usersCache.userPwdRecovery({ key: { ActivationKey: activationKey }, Password: password })
                    .then((user) => {
                        let fromApp = activationKey.substr(activationKey.length - Activation.APP_SUFIX.length) === Activation.APP_SUFIX;
                        if (fromApp) {
                            let url = new URL(config.authentication.appLoginUrl);
                            url.searchParams.append('login', user.Email);
                            res.json({ redirectUrl: url.href });
                        }
                        else
                            StdLogin(req, res, user, { message: "User Password Recovery: Unknown error." });
                    })
                    .catch((err) => {
                        res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                    });
            });
        });

        app.post("/api/register", (req, res) => {
            chechRecapture(config.authentication.useCapture, req, res, () => {
                let data =
                    {
                        Login: req.body.login,
                        Name: (req.body.name && (req.body.name.trim().length > 0)) ? req.body.name.trim() : req.body.login
                };
                if (req.campaignId)
                    data.CampaignId = req.campaignId;
                let password = req.body.password;
                UserRegister(password, data, this._usersCache)
                    .then((user) => {
                        StdLogin(req, res, user, { message: "User Register: Unknown error." });
                    })
                    .catch((err) => {
                        if (err instanceof HttpError)
                            res.status(err.statusCode).json(err.errObject)
                        else
                            res.status(HttpCode.ERR_BAD_REQ).json({ message: (err && err.message) ? err.message : JSON.stringify(err) });
                    });
            });
        });

        app.get("/api/reg-resend-mail/:id", (req, res) => {
            let id = parseInt(req.params.id);
            usersCache.getUserInfo(id, false, ["Id", "Email", "PData", "ActivationKey"])
                .then((user) => {
                    if (user) {
                        if (user.PData && user.PData.roles && user.PData.roles.p && user.ActivationKey) {
                            SendRegMail(usersCache, user, user.Email, user.ActivationKey)
                                .then((result) => {
                                    res.json(result);
                                })
                                .catch((err) => {
                                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                                });
                        }
                        else {
                            res.status(HttpCode.ERR_NOT_FOUND).json({ message: "User is already activated." });
                        }
                    }
                    else
                        res.status(HttpCode.ERR_NOT_FOUND).json({ message: "User is not found." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                });
        });
    }
};

let buildRedirectUrl = (redirectUrl, errMsg) => {
    let url = (redirectUrl instanceof URL) ? redirectUrl : null;
    let err_msg = errMsg;
    if (!url){
        let path = typeof (redirectUrl) === "string" ? redirectUrl : (err_msg ? redirectUrl.error : redirectUrl.success);
        try {
            url = new URL(path, config.proxyServer.siteHost);
        }
        catch (err) {
            err_msg = err_msg ? err_msg : (err && err.message ? err.message : ('' + err));
            url = new URL("/", config.proxyServer.siteHost);
        }
    }
    if (err_msg)
        url.searchParams.append('message', err_msg);
    return url.href;
};

let addNewUserFlag = (user, in_url) => {
    let result = in_url;
    if (user && user._isNew) {
        delete user._isNew;
        let url = new URL(result);
        url.searchParams.append('_is_new_user', 'true');
        result = url.href;
    }
    return result;
}

let StdLogin = (req, res, user, info, redirectUrl, genTokenFunc, redirectBySes) => {
    let redirect_url = redirectBySes && req.session && req.session.afterAuthUrl ? req.session.afterAuthUrl : redirectUrl;
    if (!user) {
        AuthLocal.StdLogout(req)
            .then(() => {
                if (redirect_url)
                    res.redirect(buildRedirectUrl(redirect_url, (info && info.message) ? info.message : JSON.stringify(info)))
                else
                    res.status(HttpCode.ERR_UNAUTH).json(info);
            })
            .catch((err) => {
                if (redirect_url)
                    res.redirect(buildRedirectUrl(redirect_url, err.message))
                else
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
            });
    }
    else {
        let loginFunc = req.logIn.bind(req);
        if (typeof (genTokenFunc) === "function") {
            loginFunc = (user, cb) => {
                genTokenFunc(user)
                    .then(token => {
                        req.user = user;
                        if (cb)
                            cb(null, token);
                    })
                    .catch(err => {
                        if (cb)
                            cb(err);
                    });
            }
        }
        function cb(err, token) {
            if (err) {
                let msg = err instanceof Error ? err.message : err.toString();
                if (redirect_url)
                    res.redirect(buildRedirectUrl(redirect_url, msg))
                else
                    res.status(HttpCode.ERR_INTERNAL).json({ message: msg });
            }
            else
                if (redirect_url)
                    res.redirect(addNewUserFlag(user, buildRedirectUrl(redirect_url)))
                else {
                    let userData = usersCache.userToClientJSON(user);
                    if (token)
                        userData = { user: userData, token: token };
                    res.json(userData);
                }
        }
        loginFunc(user, cb);
    }
}

let chechRecapture = (hasCapture, req, res, processor) => {
    let promise = Promise.resolve();
    if (hasCapture)
        promise = recaptcha.validateRequest(req);
    promise
        .then(() => {
            if (typeof (processor) === "function")
                processor();
        }, (errorCodes) => {
            if (errorCodes && (errorCodes.length > 0) && (errorCodes[0] === "missing-input-response"))
                res.status(HttpCode.ERR_UNAUTH).json({ errors: ["Missing capture"] })
            else
                // translate error codes to human readable text
                res.status(HttpCode.ERR_UNAUTH).json({ errors: recaptcha.translateErrors(errorCodes) });
        });
}

const AuthRedirectParam = config.has('config.authentication.redirectParam') ? config.authentication.redirectParam : "redirect";

const AuthRedirectWrapper = (processor) => {
    return (req, res, next) => {
        if (req.session) {
            if (req.query && req.query[AuthRedirectParam]) {
                req.session.afterAuthUrl = req.query[AuthRedirectParam];
            }
            else
                delete req.session.afterAuthUrl;
        }
        return processor(req, res, next);
    }    
}

const getAuthProcessor = (req, res, next, redirectUrl, genTokenFunc, redirectBySes) => {
    return (err, user, info) => {
        let redirect_url = redirectBySes && req.session && req.session.afterAuthUrl ? req.session.afterAuthUrl : redirectUrl;
        if (err || !user) {
            AuthLocal.StdLogout(req)
                .then(() => {
                    if (err) {
                        if (redirect_url)
                            res.redirect(buildRedirectUrl(redirect_url, err.toString()))
                        else {
                            let statusCode = err instanceof HttpError ? err.statusCode : HttpCode.ERR_UNAUTH;
                            let errMsg = err instanceof HttpError ? err.message : err.toString();
                            res.status(statusCode).json({ message: errMsg });
                        }
                        return;
                    }
                    if (!user) {
                        if (redirect_url)
                            res.redirect(buildRedirectUrl(redirect_url, (info && info.message) ? info.message : JSON.stringify(info)))
                        else
                            res.status(HttpCode.ERR_UNAUTH).json(info);
                        return;
                    }
                })
                .catch((err) => {
                    if (redirect_url)
                        res.redirect(buildRedirectUrl(redirect_url, err.message))
                    else
                        res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                });
        }
        else
            StdLogin(req, res, user, null, redirectUrl, genTokenFunc, redirectBySes);
    }
}

const StdLoginProcessor = (strategy, hasCapture, redirectUrl, genTokenFunc, redirectBySes) => {
    return (req, res, next) => {
        chechRecapture(hasCapture, req, res, () => {
            passport.authenticate(strategy, getAuthProcessor(req, res, next, redirectUrl, genTokenFunc, redirectBySes))(req, res, next);
        })
    }
};

const AuthByToken = (getUserProfile, processUserProfile, redirectUrl, genTokenFunc, options) => {
    let opts = options || {};
    if (typeof (getUserProfile) !== "function")
        throw new Error(`Arg "getUserProfile" must be a function.`);
    if (typeof (processUserProfile) !== "function")
        throw new Error(`Arg "processUserProfile" must be a function.`);
    return (req, res, next) => {
        let accessToken = typeof (opts.getToken) === "function" ? opts.getToken(req) : req.query.accessToken;
        let refreshToken = null;
        let authProcessor = getAuthProcessor(req, res, next, redirectUrl, genTokenFunc);
        getUserProfile(accessToken, (err, profile) => {
            if (err)
                next(err)
            else {
                if (processUserProfile.length === 6) {
                    let rawParams = req.query;
                    processUserProfile(req, accessToken, refreshToken, rawParams, profile, authProcessor)
                }
                else
                    processUserProfile(req, accessToken, refreshToken, profile, authProcessor);
            }
        })
    }
}

const isFeatureEnabled = config.get('authentication.enabled');
let authLocal = null;
let AuthLocalInit = (app) => {
    if ((!authLocal) && isFeatureEnabled)
        authLocal = new AuthLocal(app);
};

exports.GetTokenFromReq = (req) => { return AuthLocal.getTokenFromReq(req) };
exports.SetupWhoAmI = (app) => { AuthLocal.setupWhoAmI(app) };
exports.SetupLogOut = (app) => { AuthLocal.setupLogOut(app) };
exports.ChechRecapture = chechRecapture;
exports.AuthLocalInit = AuthLocalInit;
exports.DestroySession = AuthLocal.destroySession.bind(AuthLocal);
exports.StdLoginProcessor = StdLoginProcessor;
exports.AuthByToken = AuthByToken;
exports.AuthRedirectWrapper = AuthRedirectWrapper;
exports.StdLogin = StdLogin;
exports.StdLogout = AuthLocal.StdLogout.bind(AuthLocal);
exports.AuthenticateLocal = (app, isAuthRequired, accessRights) => {
    AuthLocalInit(app);
    return (req, res, next) => {
        if (isFeatureEnabled) {
            if (isAuthRequired) {
                if (!req.user)
                    return res.status(HttpCode.ERR_UNAUTH).json({ message: "Authorization required" });
                if (accessRights) {
                    let userRights = AccessRights.checkPermissions(req.user, accessRights)
                    if(userRights!==accessRights)
                        return res.status(HttpCode.ERR_FORBIDDEN).json({ message: "Access denied." });
                }
            }
        }
        return next();    
    };
};