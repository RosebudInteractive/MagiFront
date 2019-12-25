'use strict';
//
// Upgrade to version ["ProtoOne" v.1.0.0.1 build 25]
//
exports.upgradeRes = async (api) => {
    await require('./authorGridForm')(api);
    await require('./authorForm')(api);
};
