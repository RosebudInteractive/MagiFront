'use strict'
const config = require('config');
const passport = require("passport");
const passportGoogle = require('passport-google-oauth20');
const { HttpCode } = require("../const/http-codes");
const { UsersCache } = require("./users-cache");
const { StdLoginProcessor, AuthByToken, AuthRedirectWrapper } = require('./local-auth');
const { GenTokenFunc } = require('./jwt-auth');

const GOOGLE_USER_INFO = "https://www.googleapis.com/oauth2/v3/userinfo"; // https://developers.google.com/identity/protocols/OpenIDConnect
class AuthGoogle {

    constructor(app, sessionMiddleware) {
        const GoogleStrategy = passportGoogle.Strategy;
        const GoogleOptions =
        {
            clientID: config.snets.google.appId,
            clientSecret: config.snets.google.appSecret,
            callbackURL: config.proxyServer.siteHost + config.snets.google.callBack,
            passReqToCallback: true,
            userProfileURL: GOOGLE_USER_INFO
        };

        this._usersCache = UsersCache();

        const processUserProfile = ((req, accessToken, refreshToken, params, profile, done) => {

            // google won't allow to use an email w/o verification
            if (!profile.emails || !profile.emails[0]) { // user may allow authentication, but disable email access (e.g in fb)
                done(null, false, { message: "\"Email\" is required for application!" });
                return;
            }

            let name_arr = [];
            if (profile.name) {
                if (profile.name.givenName)
                    name_arr.push(profile.name.givenName);
                if (profile.name.familyName)
                    name_arr.push(profile.name.familyName);
            }
            profile.displayName = name_arr.length > 0 ? name_arr.join(" ") : profile.emails[0];
            if (profile.name) {
                profile.username = profile.name.givenName;
                profile.firstName = profile.name.givenName;
                profile.lastName = profile.name.familyName;
            }
            profile.identifier = profile.id;

            if (req.campaignId)
                profile.CampaignId = req.campaignId;

            this._usersCache.getUserByProfile(profile)
                .then((user) => {
                    done(null, user ? user : false);
                })
                .catch((err) => {
                    done(err);
                });
        }).bind(this);

        const strategy = new GoogleStrategy(GoogleOptions, processUserProfile);

        passport.use(strategy);

        if (sessionMiddleware && (config.snets.google.callBack.indexOf("/api/") !== 0)) {
            app.use(config.snets.google.callBack, sessionMiddleware.express);
            app.use(config.snets.google.callBack, sessionMiddleware.passportInit);
            app.use(config.snets.google.callBack, sessionMiddleware.passportSession);
            if (sessionMiddleware.rollSession)
                app.use(config.snets.google.callBack, sessionMiddleware.rollSession);   
        }

        app.get('/api/googlelogin', AuthRedirectWrapper(passport.authenticate('google', config.snets.google.passportOptions)));
        app.get('/api/app-googlelogin', AuthByToken(strategy.userProfile.bind(strategy), processUserProfile, null, GenTokenFunc));
        let processor = (!config.snets.google.redirectURL) ? StdLoginProcessor('google', false, null, null, true) :
            StdLoginProcessor('google', false, config.snets.google.redirectURL, null, true);
        app.get(config.snets.google.callBack, processor);
    }
};

let authGoogle = null;
let AuthGoogleInit = (app, sessionMiddleware) => {
    if (!authGoogle)
        authGoogle = new AuthGoogle(app, sessionMiddleware);
};

exports.AuthGoogleInit = AuthGoogleInit;
