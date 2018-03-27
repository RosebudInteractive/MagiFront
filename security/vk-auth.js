'use strict'
const config = require('config');
const passport = require("passport");
const passportVKontakte = require('passport-vkontakte');
const { HttpCode } = require("../const/http-codes");
const { UsersMemCache } = require("./users-mem-cache");
const { UsersRedisCache } = require("./users-redis-cache");
const { StdLoginProcessor, DestroySession } = require('./local-auth');

class AuthVK {

    constructor(app, sessionMiddleware) {
        const VKontakteStrategy = passportVKontakte.Strategy;
        const VKontakteOptions =
            {
                clientID: config.snets.vk.appId,
                clientSecret: config.snets.vk.appSecret,
                callbackURL: config.proxyServer.siteHost + config.snets.vk.callBack,
                profileFields: config.snets.vk.profileFields, // additional fields
                apiVersion: config.snets.vk.apiVersion,
                passReqToCallback: true
            };

        this._usersCache = config.get('authentication.storage') === "redis" ? UsersRedisCache() : UsersMemCache(); // UsersMemCache can't be used in cluster mode

        const strategy = new VKontakteStrategy(VKontakteOptions,
            ((req, accessToken, refreshToken, rawParams, profile, done) => {
                // VK doesn't give an email in a profile, use raw authentication response data instead
                if (!rawParams.email) { // user may allow authentication, but disable email access (e.g in fb)
                    done(null, false, { message: "\"Email\" field is required for application!" });
                    return;
                }
                profile.emails = [{ type: "email", value: rawParams.email }];
                profile.description = profile._json.about && (profile._json.about.length > 0) ? profile._json.about : null;
                profile.city = profile._json.city ? profile._json.city.title : null;
                profile.country = profile._json.country ? profile._json.country.title : null;
                profile.firstName = profile._json.first_name ? profile._json.first_name : null;
                profile.lastName = profile._json.last_name ? profile._json.last_name : null;
                profile.identifier = profile.id + "";
                if (typeof (profile.birthday) === "string") {
                    let barr = profile.birthday.split("-");
                    if (barr.length === 3) {
                        profile.yearOfBirth = parseInt(barr[0]);
                        profile.monthOfBirth = parseInt(barr[1]);
                        profile.dayOfBirth = parseInt(barr[2]);
                        if (isNaN(profile.yearOfBirth) || isNaN(profile.monthOfBirth) || isNaN(profile.dayOfBirth)) {
                            delete profile.yearOfBirth;
                            delete profile.monthOfBirth;
                            delete profile.dayOfBirth;
                        }
                    }
                }
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
            app.use(config.snets.vk.callBack, sessionMiddleware.express);
            app.use(config.snets.vk.callBack, sessionMiddleware.passportInit);
            app.use(config.snets.vk.callBack, sessionMiddleware.passportSession);   
        }

        app.get('/api/vklogin', passport.authenticate('vkontakte', config.snets.vk.passportOptions));
        app.get(config.snets.vk.callBack, StdLoginProcessor('vkontakte'));
    }
};

let authVK = null;
let AuthVKInit = (app, sessionMiddleware) => {
    if (!authVK)
        authVK = new AuthVK(app, sessionMiddleware);
};

exports.AuthVKInit = AuthVKInit;
