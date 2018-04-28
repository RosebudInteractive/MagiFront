'use strict'
const _ = require('lodash');
const { LessonPositionsBase } = require('./lesson-pos-base');

const LessonPositionsMem = class LessonPositionsMem extends LessonPositionsBase {

    constructor(options) {
        super(options);
        this._positions = {};
    }

    _getAllPos(userId) {
        return Promise.resolve(this._positions[userId] || {});
    }

    _setPos(userId, pos) {
        return new Promise((resolve) => {
            let currUser = this._positions[userId];
            if (!currUser) {
                currUser = this._positions[userId] = {};
            }
            currUser[pos.id] = _.cloneDeep(pos.data);
            resolve();
        });
    }
};

let lessonPositionsMem = null;
module.exports = (options) => {
    return lessonPositionsMem ? lessonPositionsMem : lessonPositionsMem = new LessonPositionsMem(options);
};