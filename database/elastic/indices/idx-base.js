'use strict';
const _ = require('lodash');
const striptags = require('striptags');
const { HttpCode } = require("../../../const/http-codes");
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

    _striptags(data) {
        let res = striptags(data, ['p', 'br', 'h1', 'h2', 'h3', 'h4']); // preserve some tags
        return striptags(res, [], '\n'); // replace them by LF
    }

    async _getData(store_func, delete_func, opts) {
        throw new Error(`IdxBase::_getData: Should be implemented in descendant!`)
    }

    async _delete(conn, query, options) {
        let opts = options || {};
        let result = 0;
        let { body: { count } } = await conn.count({
            index: this.indexName,
            body: query
        });
        if (count > 0) {
            let search_res = await conn.search({
                index: this.indexName,
                size: count,
                _source: false,
                body: query
            });
            let { body: { hits: { hits } } } = search_res;
            for (let i = 0; i < hits.length; i++) {
                try {
                    await conn.delete({
                        index: this.indexName,
                        id: hits[i]._id,
                        refresh: opts.refresh ? opts.refresh : 'false'
                    });
                    result++;
                }
                catch (err) {
                    if (err.statusCode !== HttpCode.ERR_NOT_FOUND) // Ignore 404 error
                        throw err;
                }
            }
        }
        return result;
    }

    async processHit(hit, baseUrl) {
        throw new Error(`IdxBase::processHit: Should be implemented in descendant!`)
    }

    async importData(conn, options) {

        let start_ts = new Date();
        let opts = _.defaultsDeep(options, {});
        let rows_inserted = 0;
        let rows_updated = 0;
        let rows_deleted = 0;
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
                        body: { doc: body },
                        refresh: opts.refresh ? opts.refresh: 'false'
                    });
                    rows_updated++
                }
                else {
                    if (data_options.createDateField && (!body[data_options.createDateField]))
                        body[data_options.createDateField] = new Date();
                    res = await conn.create({
                        index: this.indexName,
                        id: id,
                        body: body,
                        refresh: opts.refresh ? opts.refresh : 'false'
                    });
                    rows_inserted++;
                }
            }
        }, async (id) => {
                try {
                    await conn.delete({
                        index: this.indexName,
                        id: id,
                        refresh: opts.refresh ? opts.refresh : 'false'
                    });
                    rows_deleted++;
                }
                catch (err) {
                    if (err.statusCode !== HttpCode.ERR_NOT_FOUND) // Ignore 404 error
                        throw err;
                }
        }, opts);

        return {
            index: this.indexName,
            is_created: is_created,
            is_deleted: is_deleted,
            inserted: rows_inserted,
            updated: rows_updated,
            deleted: rows_deleted,
            total: rows_inserted + rows_updated,
            time: (new Date()) - start_ts
        };
    }
};
