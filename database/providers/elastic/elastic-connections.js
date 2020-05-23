'use strict';
const config = require('config');
const ElasticConnectionManager = require('./connection-mgr');

let elasticConnections = null;

exports.ElasticConWrapper = (func, auto_connect, connect_config) => {
    return new Promise(resolve => {
        let rc = null;
        if (elasticConnections === null) {
            if (auto_connect)
                getConnections(connect_config)
            else
                rc = Promise.reject("ConnectionWrapper: Elastic connection hasn't been inintialized.");
        }
        if (!rc)
            rc = elasticConnections.getConnection()
                .then((connection) => {
                    return func(connection)
                        .then((result) => {
                            return elasticConnections.releaseConnection(connection)
                                .then(() => {
                                    return result;
                                });
                        })
                        .catch((err) => {
                            return elasticConnections.releaseConnection(connection)
                                .then(() => {
                                    throw err;
                                });
                        });
                });
        resolve(rc);
    });
}

let getConnections = (options) => {
    if (!elasticConnections) {
        let opts = options || (config.has('connections.elastic') ? config.connections.elastic : null);
        if (!opts)
            throw new Error(`ElasticConnections: Connection isn't configured!`);
        elasticConnections = new ElasticConnectionManager(null, opts);
        elasticConnections.initPools();
    }
    return elasticConnections;
};

exports.ElasticConnections = getConnections;