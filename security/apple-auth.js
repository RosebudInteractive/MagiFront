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

            profile.displayName = profile.givenName || profile.familyName ?
                ((profile.name.givenName ? profile.name.givenName + " " : "") +
                    (profile.name.familyName ? profile.name.familyName : "")) : profile.identifier;
            profile.username = profile.givenName ? profile.givenName : profile.identifier;
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
                var signingKey = key.publicKey || key.rsaPublicKey;
                callback(err ? err : null, signingKey);
            });
        }

        let _aud = config.authentication.appleMobileAppAud;

        function getUserProfile(token, profileProcessor) {
            let profile = {};
            try {
                jwt.verify(token, getApplePublicKey, null, function (err, decoded) {
                    let _err = err;
                    if (!err) {
                        if (decoded.iss !== APPLE_ISSUER)
                            _err = new Error(`Unexpected issuer (iss claim): ${decoded.iss}.`)
                        else
                            if (decoded.aud !== _aud)
                                _err = new Error(`Unexpected audience (aud claim): ${decoded.aud}.`)
                            else
                                if (!decoded.email)
                                    _err = new Error(`Необходимо наличие подтвержденного Email.`)

                        profile.provider = APPLE_PROFILE_PROVIDER_CODE;
                        profile.identifier = decoded.sub;
                        profile.emails = [{ type: "email", value: decoded.email }];
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

        app.get('/api/app-applelogin', AuthByToken(getUserProfile, processUserProfile, null, GenTokenFunc, { getToken: getTokenFunc }));
        // app.get('/api/app-applelogin', (req, res, next) => {
        //     next(new HttpError(HttpCode.ERR_NIMPL, HttpMessage[HttpCode.ERR_NIMPL]));
        // });
    }
};

let authApple = null;
let AuthAppleInit = (app, sessionMiddleware) => {
    if (!authApple)
        authApple = new AuthApple(app, sessionMiddleware);
};

exports.AuthAppleInit = AuthAppleInit;
