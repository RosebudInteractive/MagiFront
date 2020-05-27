'use strict';
const _ = require('lodash');
const { DbObject } = require('../../db-object');

const DFLT_OPTIONS = {
    index: null,
    mappings: {},
    settings: {
        analysis: {
            analyzer: "russian"
        }
    }
};

exports.IdxBase = class IdxBase extends DbObject {

    get indexName() {
        return this._options.index;
    }

    get mappings() {
        return this._options.mappings;
    }

    get settings() {
        return this._options.settings;
    }

    constructor(options) {
        super(options);
        this._options = _.defaultsDeep(options, DFLT_OPTIONS);
        if (!this._options.index)
            throw new Error(`Missing index name.`);
    }

    async _getData(store_func, opts) {
    }

    async processHit(hit, baseUrl) {
        return hit;    
    }

    async importData(conn, options) {

        let start_ts = new Date();
        let opts = _.defaultsDeep(options, {});
        let rows_inserted = 0;
        let rows_updated = 0;
        let is_created = false;
        let is_deleted = false;

        if (opts.clearBefore) {
            let { body: exists } = await conn.indices.exists({ index: this.indexName });
            if (exists) {
                await conn.indices.delete({ index: this.indexName });
                is_deleted = true;
            }
            let res = await conn.indices.create({
                index: this.indexName,
                body: {
                    settings: this.settings,
                    mappings: this.mappings
                }
            });
            is_created = true;
        }

        await this._getData(async (data, options) => {
            let data_options = options || {};
            for (let i = 0; i < data.length; i++) {
                let id = `` + data[i].Id;
                delete data[i].Id;
                let body = data[i];
                let { body: res } = await conn.exists({
                    index: this.indexName,
                    id: id
                });
                if (res) {
                    if (data_options.createDateField)
                        delete body[data_options.createDateField];
                    res = await conn.update({
                        index: this.indexName,
                        id: id,
                        body: { doc: body }
                    });
                    rows_updated++
                }
                else {
                    if (data_options.createDateField && (!body[data_options.createDateField]))
                        body[data_options.createDateField] = new Date();
                    res = await conn.create({
                        index: this.indexName,
                        id: id,
                        body: body
                    });
                    rows_inserted++;
                }
            }
        }, opts);

        return {
            index: this.indexName,
            is_created: is_created,
            is_deleted: is_deleted,
            inserted: rows_inserted,
            updated: rows_updated,
            total: rows_inserted + rows_updated,
            time: (new Date()) - start_ts
        };
    }
};
