import {
    LESSON_INFO_STORAGE_SET_CURRENT_TIME
} from '../constants/lesson-info-storage'

export const setCurrentTimeForLesson = (data) => {
    return {
        type: LESSON_INFO_STORAGE_SET_CURRENT_TIME,
        payload: data
    }
};