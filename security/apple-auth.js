'use strict'
const config = require('config');
const { HttpCode, HttpMessage } = require("../const/http-codes");
const { HttpError } = require('../errors/http-error');
const { UsersCache } = require("./users-cache");
const { StdLoginProcessor, AuthByToken, AuthRedirectWrapper } = require('./local-auth');
const { GenTokenFunc } = require('./jwt-auth');

class AuthApple {

    constructor(app, sessionMiddleware) {
        this._usersCache = UsersCache();

        const processUserProfile = ((req, accessToken, refreshToken, params, profile, done) => {

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

        app.get('/api/app-applelogin', (req, res, next) => {
            next(new HttpError(HttpCode.ERR_NIMPL, HttpMessage[HttpCode.ERR_NIMPL]));
        });
    }
};

let authApple = null;
let AuthAppleInit = (app, sessionMiddleware) => {
    if (!authApple)
        authApple = new AuthApple(app, sessionMiddleware);
};

exports.AuthAppleInit = AuthAppleInit;
