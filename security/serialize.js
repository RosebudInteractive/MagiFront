'use strict'
const config = require('config');
const passport = require("passport");

let usersCache = null;
module.exports = (users_cache) => {
    if (!usersCache) {
        usersCache = users_cache;
        passport.serializeUser((user, done) => {
            done(null, user.Id.toString());
        });

        passport.deserializeUser((id, done) => {
            let idUser = parseInt(id);
            usersCache.getUserInfoById(idUser)
                .then((user) => {
                    done(null, user);
                })
                .catch((err) => {
                    done(err);
                });
        });
    };
};