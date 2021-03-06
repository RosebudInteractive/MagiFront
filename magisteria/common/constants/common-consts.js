export const DATA_EXPIRATION_TIME = 3 * 60 * 1000

export const CONTENT_TYPE = {
    AUDIO: 1,
    VIDEO: 2,
}

export const LESSON_STATE = {
    READY: "R",
    DRAFT: "D",
    ARCHIVE: "A"
}

export const COURSE_VIDEO_TYPE = {
    INTERVIEW: "INTERVIEW",
    PREVIEW: "PREVIEW",
}

export const TEST_PAGE_TYPE = {
    TEST: "TEST",
    INSTANCE: "INSTANCE",
    RESULT: "RESULT",
}

export const ANSWER_TYPES = {
    NUMBER: 1,
    BOOL: 2,
    SELECT: 3,
    MULTI_SELECT: 4,
    TEXT: 5,
}

export const TEST_TYPE = {
    COMMON: 1,
    STARTED: 2,
    FINISHED: 3,
    EXT: 4,
}

export const FILTER_TYPE = {
    RAZDEL: "RAZDEL",
    RAZDEL_REVERSE: "RAZDEL_EXT",
    KNOWLEDGE: "KNOWLEDGE",
    KNOWHOW: "KNOWHOW",
    EMPTY: "EMPTY",
}

export const SEARCH_SORT_TYPE = {
    BY_RELEVANCY: {name: "by_relevancy", value: null},
    BY_DATE: {name: "by_date", value: {"pubDate":"desc"}},
    BY_DATE_ASC: {name: "by_date_asc", value: {"pubDate":"asc"}},
}


export const PLAYER_CONTROLLER_MODE = {
    PLAYER: "PLAYER",
    COVER: "COVER"
}

export const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/