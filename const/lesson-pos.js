'use strict';

exports.LessonPos = {
    KEY_PREFIX: "lpos:user:",
    KEY_HIST_PREFIX: "lhist:",
    HIST_TTL: 30 * 24 * 60 * 60, // 30 days
    MAX_IDLE_INTERVAL: 10 * 60, // 10 min
    MAX_INTERVAL: 1 * 60 * 60 // 1 hour
};
