import {
    LESSON_INFO_STORAGE_SET_CURRENT_TIME,
    LESSON_INFO_STORAGE_SET_VOLUME,
    LESSON_INFO_STORAGE_SET_MUTE_STATE
} from '../constants/lesson-info-storage'

export const setCurrentTimeForLesson = (data) => {
    return {
        type: LESSON_INFO_STORAGE_SET_CURRENT_TIME,
        payload: data
    }
};

export const setVolume = (value) => {
    return {
        type: LESSON_INFO_STORAGE_SET_VOLUME,
        payload: value
    }
};

export const setMuteState = (value) => {
    return {
        type: LESSON_INFO_STORAGE_SET_MUTE_STATE,
        payload: value
    }
};
