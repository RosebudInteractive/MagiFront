'use strict'
const config = require('config');
const passport = require("passport");
const passportGoogle = require('passport-google-oauth20');
const { HttpCode } = require("../const/http-codes");
const { UsersMemCache } = require("./users-mem-cache");
const { UsersRedisCache } = require("./users-redis-cache");
const { StdLoginProcessor, DestroySession } = require('./local-auth');

class AuthGoogle {

    constructor(app, sessionMiddleware) {
        const GoogleStrategy = passportGoogle.Strategy;
        const GoogleOptions =
            {
                clientID: config.snets.google.appId,
                clientSecret: config.snets.google.appSecret,
                callbackURL: config.proxyServer.siteHost + config.snets.google.callBack,
                passReqToCallback: true
            };

        this._usersCache = config.get('authentication.storage') === "redis" ? UsersRedisCache() : UsersMemCache(); // UsersMemCache can't be used in cluster mode

        const strategy = new GoogleStrategy(GoogleOptions,
            ((req, accessToken, refreshToken, params, profile, done) => {

                // google won't allow to use an email w/o verification
                if (!profile.emails || !profile.emails[0]) { // user may allow authentication, but disable email access (e.g in fb)
                    done(null, false, { message: "\"Email\" is required for application!" });
                    return;
                }

                profile.displayName = profile.name.givenName + " " + profile.name.familyName;
                profile.username = profile.name.givenName;
                profile.firstName = profile.name.givenName;
                profile.lastName = profile.name.familyName;
                profile.identifier = profile.id;

                this._usersCache.getUserByProfile(profile)
                    .then((user) => {
                        done(null, user ? user : false);
                    })
                    .catch((err) => {
                        done(err);
                    });
            }).bind(this));

        passport.use(strategy);

        if (sessionMiddleware) {
            app.use(config.snets.google.callBack, sessionMiddleware.express);
            app.use(config.snets.google.callBack, sessionMiddleware.passportInit);
            app.use(config.snets.google.callBack, sessionMiddleware.passportSession);
        }

        app.get('/api/googlelogin', passport.authenticate('google', config.snets.google.passportOptions));
        app.get(config.snets.google.callBack, StdLoginProcessor('google'));
    }
};

let authGoogle = null;
let AuthGoogleInit = (app, sessionMiddleware) => {
    if (!authGoogle)
        authGoogle = new AuthGoogle(app, sessionMiddleware);
};

exports.AuthGoogleInit = AuthGoogleInit;
