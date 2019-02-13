'use strict'
const config = require('config');
const request = require('request-promise');
const passport = require("passport");
const passportFacebook = require('passport-facebook');
const { HttpCode } = require("../const/http-codes");
const { UsersCache } = require("./users-cache");
const { StdLoginProcessor, DestroySession } = require('./local-auth');
const { GenTokenFunc } = require('./jwt-auth');

class AuthFB {

    constructor(app, sessionMiddleware) {
        const FacebookStrategy = passportFacebook.Strategy;
        const FacebookOptions =
            {
                clientID: config.snets.facebook.appId,
                clientSecret: config.snets.facebook.appSecret,
                callbackURL: config.proxyServer.siteHost + config.snets.facebook.callBack,
                profileURL: config.snets.facebook.profileURL,
                profileFields: config.snets.facebook.profileFields, // additional fields: https://developers.facebook.com/docs/graph-api/reference/v2.7/user
                passReqToCallback: true
            };

        this._usersCache = UsersCache();

        const strategy = new FacebookStrategy(FacebookOptions,
            ((req, accessToken, refreshToken, params, profile, done) => {

                // facebook won't allow to use an email w/o verification
                if (!profile.emails || !profile.emails[0]) { // user may allow authentication, but disable email access (e.g in fb)
                    done(null, false, { message: "\"Email\" is required for application!" });
                    return;
                }
                
                // const response = await request.get({
                //     url: 'http://graph.facebook.com/v2.7/' + profile.id + '/picture?redirect=0&width=1000&height=1000',
                //     json: true
                // });

                profile.displayName = profile.name.givenName + " " + profile.name.familyName;
                profile.username = profile.name.givenName;
                profile.description = profile._json.about && (profile._json.about.length > 0) ? profile._json.about : null;
                profile.city = profile._json.city ? profile._json.city.title : null;
                profile.country = profile._json.country ? profile._json.country.title : null;
                profile.firstName = profile._json.first_name ? profile._json.first_name : null;
                profile.lastName = profile._json.last_name ? profile._json.last_name : null;
                profile.identifier = profile.id;
                if (typeof (profile.birthday) === "string") {
                    let barr = profile.birthday.split("/");
                    if (barr.length === 3) {
                        profile.monthOfBirth = parseInt(barr[0]);
                        profile.dayOfBirth = parseInt(barr[1]);
                        profile.yearOfBirth = parseInt(barr[2]);
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

        if (sessionMiddleware && (config.snets.facebook.callBack.indexOf("/api/") !== 0)) {
            app.use(config.snets.facebook.callBack, sessionMiddleware.express);
            app.use(config.snets.facebook.callBack, sessionMiddleware.passportInit);
            app.use(config.snets.facebook.callBack, sessionMiddleware.passportSession);
            if (sessionMiddleware.rollSession)
                app.use(config.snets.facebook.callBack, sessionMiddleware.rollSession);   
        }

        app.get('/api/fblogin', passport.authenticate('facebook', config.snets.facebook.passportOptions));
        app.get('/api/app-fblogin', StdLoginProcessor('facebook', false, null, GenTokenFunc));
        let processor = (!config.snets.facebook.redirectURL) ? StdLoginProcessor('facebook') :
            StdLoginProcessor('facebook', false, config.snets.facebook.redirectURL);
        app.get(config.snets.facebook.callBack, processor);
    }
};

let authFB = null;
let AuthFBInit = (app, sessionMiddleware) => {
    if (!authFB)
        authFB = new AuthFB(app, sessionMiddleware);
};

exports.AuthFBInit = AuthFBInit;
