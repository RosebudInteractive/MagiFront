'use strict'
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('config');
const { HttpCode, HttpMessage } = require("../const/http-codes");
const { HttpError } = require('../errors/http-error');
const { UsersCache } = require("./users-cache");
const { StdLoginProcessor, AuthByToken, AuthRedirectWrapper } = require('./local-auth');
const { GenTokenFunc } = require('./jwt-auth');

const APPLE_PROFILE_PROVIDER_CODE = "apple";
const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_AUTH_KEYS_ENDPOINT = "https://appleid.apple.com/auth/keys";

class AuthApple {

    constructor(app, sessionMiddleware) {
        this._usersCache = UsersCache();

        const processUserProfile = ((req, accessToken, refreshToken, params, profile, done) => {

            let name_arr = [];
            if (profile.nickname)
                name_arr.push(profile.nickname)
            else {
                if (profile.givenName)
                    name_arr.push(profile.givenName);
                if (profile.middleName)
                    name_arr.push(profile.middleName);
                if (profile.familyName)
                    name_arr.push(profile.familyName);
            }
            profile.displayName = name_arr.length > 0 ? name_arr.join(" ") : profile.identifier;
            profile.username = profile.nickname ? profile.nickname : (profile.givenName ? profile.givenName : profile.identifier);
            profile.firstName = profile.givenName;
            profile.lastName = profile.familyName;

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

        let client = jwksClient({
            jwksUri: APPLE_AUTH_KEYS_ENDPOINT
        });

        function getApplePublicKey(header, callback) {
            client.getSigningKey(header.kid, function (err, key) {
                var signingKey = key ? (key.publicKey || key.rsaPublicKey) : undefined;
                callback(err ? err : null, signingKey);
            });
        }

        let _aud = config.authentication.appleMobileAppAud;

        function getUserProfile(tokenObj, profileProcessor) {
            let profile = {};
            let isObject = typeof (tokenObj) === "string" ? false : true;
            let token = isObject ? tokenObj.accessToken : tokenObj;
            try {
                jwt.verify(token, getApplePublicKey, null, function (err, decoded) {
                    let _err = err;
                    if (!err) {
                        if (decoded.iss !== APPLE_ISSUER)
                            _err = new Error(`Unexpected issuer (iss claim): ${decoded.iss}.`)
                        else
                            if (decoded.aud !== _aud)
                                _err = new Error(`Unexpected audience (aud claim): ${decoded.aud}.`);

                        profile.provider = APPLE_PROFILE_PROVIDER_CODE;
                        profile.identifier = decoded.sub;
                        if (decoded.email)
                            profile.emails = [{ type: "email", value: decoded.email }];
                        if (isObject && tokenObj.fullName) {
                            profile.familyName = tokenObj.fullName.familyName;
                            profile.givenName = tokenObj.fullName.givenName;
                            profile.middleName = tokenObj.fullName.middleName;
                            profile.namePrefix = tokenObj.fullName.namePrefix;
                            profile.nameSuffix = tokenObj.fullName.nameSuffix;
                            profile.nickname = tokenObj.fullName.nickname;
                        }
                    }
                    profileProcessor(_err, profile);
                });
            }
            catch (error) {
                profileProcessor(error, profile);
            }
        }

        function getTokenFunc(req) {
            return req.query.accessToken ? req.query.accessToken : null;
        }

        function getTokenBodyFunc(req) {
            return req.body ? req.body : null;
        }

        app.get('/api/app-applelogin', AuthByToken(getUserProfile, processUserProfile, null, GenTokenFunc, { getToken: getTokenFunc }));
        app.post('/api/app-applelogin', AuthByToken(getUserProfile, processUserProfile, null, GenTokenFunc, { getToken: getTokenBodyFunc }));
    }
};

let authApple = null;
let AuthAppleInit = (app, sessionMiddleware) => {
    if (!authApple)
        authApple = new AuthApple(app, sessionMiddleware);
};

exports.AuthAppleInit = AuthAppleInit;
