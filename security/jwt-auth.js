'use strict'
const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportJWT = require("passport-jwt");
const { HttpCode } = require("../const/http-codes");
const { UsersMemCache } = require("./users-mem-cache");

const allowUnathorizedAccess = true;

class AuthJWT {

    constructor(app) {
        const ExtractJwt = passportJWT.ExtractJwt;
        const JwtStrategy = passportJWT.Strategy;

        const jwtOptions = {}
        jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
        jwtOptions.secretOrKey = 'tasmanianDevil';
        this._usersCache = new UsersMemCache(["Id", "Name", "PData"],
            {
                convUserDataFn:
                    (rawUser) => {
                        try {
                            rawUser.PData = JSON.parse(rawUser.PData);
                        }
                        catch (e) { rawUser.PData = {}; }
                        return rawUser;
                    }
            });
        const strategy = new JwtStrategy(jwtOptions,
            ((jwt_payload, next) => {
                console.log('payload received', jwt_payload);
                var user = this._usersCache.getUserInfoById(jwt_payload.id)
                    .then((result) => {
                        next(null, result);
                    })
                    .catch(() => {
                        next(null, false);
                    
                    });
            }).bind(this));

        passport.use(strategy);
        app.use(passport.initialize());

        app.post("/api/login",
            ((req, res) => {
                if (req.body && req.body.name && req.body.password) {
                    let login = req.body.name;
                    let password = req.body.password;
                    this._usersCache.authUser(login, password)
                        .then((result) => {
                            let payload = { id: result.Id };
                            let token = jwt.sign(payload, jwtOptions.secretOrKey);
                            this._usersCache.checkToken("JWT " + token, true)
                                .then((result) => {
                                    res.json({ token: token });
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

let authJWT = null;
exports.AuthenticateJWT = (app) => {
    if (!authJWT)
        authJWT = new AuthJWT(app);
    return (req, res, next) => {
        if (allowUnathorizedAccess) { return next(); }
        passport.authenticate('jwt', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(HttpCode.ERR_UNAUTH).json({ message: "Invalid token!" }); }
            let token = req.headers["authorization"];
            authJWT.checkToken(token)
                .then((result) => {
                    if (result) {
                        req.user = user;
                        return next();
                    }
                    else
                        return res.status(HttpCode.ERR_UNAUTH).json({ message: "Token expired or invalid!" });    
                })
                .catch((err) => {
                    return res.status(HttpCode.ERR_INTERNAL)
                        .json({ message: err.toString() });
                });
        })(req, res, next);
    };
};