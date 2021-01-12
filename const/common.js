'use strict';

exports.Import = {
    FILE_FIELD_SEPARATOR: "@",
    FILE_LIST_SEPARATOR: "#",
    PARAGRAPH_MERGE_SYMBOL: "§",
    HYPER_LINK_PREFIX: " [[",
    HYPER_LINK_SUFFIX: "]]"
};

exports.SEO = {
    NULL_USER_AGENT: "magisteria-null",
    FORCE_RENDER_USER_AGENT: "magisteria-internal",
    BOT_USER_AGENT: "magisteria-bot"
};

exports.Data = {
    ENDPOINT_FIELD_LENGTH: 255
};

exports.Intervals = {
    MIN_FREE_LESSON: 60 * 1000 // 1 minute
};

exports.AccessFlags = {
    Administrator: 1,
    ContentManager: 2,
    Subscriber: 4,
    Pending: 8
};
