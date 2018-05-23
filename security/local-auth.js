'use strict'
const { URL, URLSearchParams } = require('url');
const config = require('config');
const passport = require('passport');
const passportLocal = require('passport-local');
const reCAPTCHA = require('recaptcha2');
const { HttpCode } = require("../const/http-codes");
const { UsersMemCache } = require("./users-mem-cache");
const { UsersRedisCache } = require("./users-redis-cache");
const { UserRegister } = require("./user-register");
const { SendRegMail } = require("./user-register");
const { UserActivate } = require("./user-activate");
const { UserPwdRecovery } = require("./user-pwd-recovery");
const { UserLoginError } = require("./errors");

const serialize = require('./serialize');

let usersCache = null;
let recaptcha = new reCAPTCHA({
    siteKey: config.authentication.reCapture.siteKey,
    secretKey: config.authentication.reCapture.secretKey
});

class AuthLocal {

    static destroySession(req) {
        return new Promise((resolve, reject) => {
            if (req.session)
                req.session.destroy((err) => {
                    if (err) reject(err)
                    else resolve();
                });
            else
                resolve();
        })
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

        usersCache = this._usersCache = config.get('authentication.storage') === "redis" ? UsersRedisCache() : UsersMemCache(); // UsersMemCache can't be used in cluster mode

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

        app.get("/api/whoami", (req, res) => {
            if (req.user)
                res.json(usersCache.userToClientJSON(req.user))
            else
                res.status(HttpCode.ERR_UNAUTH).json({ message: "Unauthorized." });
        });

        app.get("/api/get-activated-user/:activationKey", (req, res) => {
            usersCache.getUserInfo({ field: "ActivationKey", op: "=", value: req.params.activationKey }, true)
                .then((user) => {
                    if (user)
                        res.json(user);
                    else
                        res.status(HttpCode.ERR_NOT_FOUND).json({ message: "User is not found." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                });
        });

        app.get("/api/logout", (req, res) => {
            AuthLocal.destroySession(req)
                .then(() => {
                    res.status(HttpCode.OK).json({ message: "OK" });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                });
        });

        app.get("/api/activation/:activationKey", (req, res) => {
            UserActivate(req.params.activationKey, this._usersCache)
                .then((user) => {
                    StdLogin(req, res, user, { message: "Activation key has expired." });
                })
                .catch((err) => {
                    res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
                });
        });

        app.get("/api/recovery/:email", (req, res) => {
            UserPwdRecovery({ key: { Email: req.params.email } }, this._usersCache)
                .then((user) => {
                    res.json(user);
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
                let password = req.body.password;
                UserRegister(password, data, this._usersCache)
                    .then((user) => {
                        StdLogin(req, res, user, { message: "User Register: Unknown error." });
                    })
                    .catch((err) => {
                        res.status(HttpCode.ERR_BAD_REQ).json({ message: err.toString() });
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
    let path = errMsg ? redirectUrl.error : redirectUrl.success;
    const url = new URL(config.proxyServer.siteHost + path);
    if(errMsg)
        url.searchParams.append('message', errMsg);
    return url.href;
};

let StdLogin = (req, res, user, info, redirectUrl) => {
    if (!user) {
        AuthLocal.destroySession(req)
            .then(() => {
                if (redirectUrl)
                    res.redirect(buildRedirectUrl(redirectUrl, (info && info.message) ? info.message : JSON.stringify(info)))
                else
                    res.status(HttpCode.ERR_UNAUTH).json(info);
            })
            .catch((err) => {
                if (redirectUrl)
                    res.redirect(buildRedirectUrl(redirectUrl, err.message))
                else
                    res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
            });
    }
    else
        req.logIn(user, (err) => {
            if (err) {
                let msg = err instanceof Error ? err.message : err.toString();
                if (redirectUrl)
                    res.redirect(buildRedirectUrl(redirectUrl, msg))
                else
                    res.status(HttpCode.ERR_INTERNAL).json({ message: msg });
            }
            else
                if (redirectUrl)
                    res.redirect(buildRedirectUrl(redirectUrl))
                else
                    res.json(usersCache.userToClientJSON(user));
        });
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

let StdLoginProcessor = (strategy, hasCapture, redirectUrl) => {
    return (req, res, next) => {
        chechRecapture(hasCapture, req, res, () => {
            passport.authenticate(strategy, (err, user, info) => {
                if (err || !user) {
                    AuthLocal.destroySession(req)
                        .then(() => {
                            if (err) {
                                if (redirectUrl)
                                    res.redirect(buildRedirectUrl(redirectUrl, err.toString()))
                                else
                                    res.status(HttpCode.ERR_UNAUTH).json({ message: err.toString() });
                                return;
                            }
                            if (!user) {
                                if (redirectUrl)
                                    res.redirect(buildRedirectUrl(redirectUrl, (info && info.message) ? info.message : JSON.stringify(info)))
                                else
                                    res.status(HttpCode.ERR_UNAUTH).json(info);
                                return;
                            }
                        })
                        .catch((err) => {
                            if (redirectUrl)
                                res.redirect(buildRedirectUrl(redirectUrl, err.message))
                            else
                                res.status(HttpCode.ERR_INTERNAL).json({ message: err.message });
                        });
                }
                else
                    StdLogin(req, res, user, null, redirectUrl);
            })(req, res, next);
        })
    }
};

const isFeatureEnabled = config.get('authentication.enabled');
let authLocal = null;
let AuthLocalInit = (app) => {
    if ((!authLocal) && isFeatureEnabled)
        authLocal = new AuthLocal(app);
};

exports.AuthLocalInit = AuthLocalInit;
exports.DestroySession = AuthLocal.destroySession;
exports.StdLoginProcessor = StdLoginProcessor;
exports.AuthenticateLocal = (app, isAuthRequired) => {
    AuthLocalInit(app);
    return (req, res, next) => {
        if (!isFeatureEnabled) { return next(); }
        if (isAuthRequired && !req.user)
            return res.status(HttpCode.ERR_UNAUTH).json({ message: "Authorization required" })
        else
            next();    
    };
};