const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

exports.DbObject = class DbObject {

    constructor(options) {
        this._db = $memDataBase;
    }

    _getObjById(id, expression) {
        return new Promise((resolve) => {
            if (!expression)
                throw new Error("DbObject::_getObjById: Invalid parameter \"expression\": " + JSON.stringify(expression));
            let exp_filtered = Object.assign({}, expression);

            var predicate = new Predicate(this._db, {});
            predicate
                .addCondition({ field: "Id", op: "=", value: id });
            exp_filtered.expr.predicate = predicate.serialize(true);

            resolve(
                this._db.getData(Utils.guid(), null, null, exp_filtered)
                    .then((result) => {
                        if (result && result.guids && (result.guids.length === 1)) {
                            let obj = this._db.getObj(result.guids[0]);
                            if (!obj)
                                throw new Error("DbObject::_getObjById: Object doesn't exist: " + result.guids[0]);
                            return obj;
                        }
                        else
                            throw new Error("DbObject::_getObjById: Invalid result of \"getData\": " + JSON.stringify(result));
                    })
            );
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    get(id) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    del(id) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }

    insert(data) {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }
}
