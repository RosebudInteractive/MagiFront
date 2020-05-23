'use strict';
const _ = require('lodash');
const elasticsearch = require('@elastic/elasticsearch');
const Base = require(UCCELLO_CONFIG.uccelloPath + 'dataman/providers/base/connection-mgr');

const DFLT_CONNECTION_OPTIONS = {
    connection_options: {
        node: 'http://localhost:9200'
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};

module.exports = class ElasticConnectionManager extends Base {
    constructor(engine, options) {
        let opts = _.defaultsDeep(options, DFLT_CONNECTION_OPTIONS);
        super(engine, opts);
    }

    connect(config) {
        return new Promise(resolve => {
            let client = new elasticsearch.Client(config.connection_options);
            let rc = client.ping()
                .then(() => { return client });
            resolve(rc);
        });
    }

    disconnect(connection) {
        return connection.close();
    }
}
