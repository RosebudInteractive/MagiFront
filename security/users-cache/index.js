'use strict';
const config = require('config');
const { UsersMemCache } = require("./users-mem-cache");
const { UsersRedisCache } = require("./users-redis-cache");

exports.UsersCache = () => {
    return config.get('authentication.storage') === "redis" ? UsersRedisCache()
        : UsersMemCache(); // UsersMemCache can't be used in cluster mode
}
