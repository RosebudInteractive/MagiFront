'use strict';
const _ = require('lodash');
const config = require('config');
const { URL, URLSearchParams } = require('url');
const fs = require('fs');

const { Task } = require('../lib/task');
const { LsnHistoryService } = require('../../database/db-lsn-history');
const { getTimeStr, buildLogString } = require('../../utils');
const { DbUtils } = require('../../database/db-utils');
const MemDbPromise = require(UCCELLO_CONFIG.uccelloPath + 'memdatabase/memdbpromise');
const Predicate = require(UCCELLO_CONFIG.uccelloPath + 'predicate/predicate');
const Utils = require(UCCELLO_CONFIG.uccelloPath + 'system/utils');

const MAX_CORRUPT_CODES = 5000;

const dfltSettings = {
    maxInsertNum: 10,
    completion: {
        maxInsertNum: 10,
        coeff: 0.95,
    },
    logStat: false
};

const NOTIFICATION_SERVICE_PATH = '../../services/notification';

exports.NotificationTask = class NotificationTask extends Task {

    #notificationService = null;

    constructor(name, options) {
        super(name, options);
        let opts = options || {};
        if (config.has('notifications.provider') && config.get('notifications.provider')) {
            this.#notificationService = require(`${NOTIFICATION_SERVICE_PATH}/providers/${config.get('notifications.provider')}`).NotificationService;
        }
        else
            this.#notificationService = require(`${NOTIFICATION_SERVICE_PATH}/notification-api`);
        this.#notificationService = this.#notificationService();
    }

    async run(fireDate) {
        let { courses, lessons } = await this.#notificationService.sendAutoNotifications({ startDate: fireDate });
        let msg = `### ${this.name} ### new courses: ${courses}, new lessons: ${lessons}.`;
        console.log(buildLogString(msg));
    }
};
