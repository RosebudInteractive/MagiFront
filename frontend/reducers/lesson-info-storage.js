import {
    LESSON_INFO_STORAGE_SET_CURRENT_TIME,
    LESSON_INFO_STORAGE_SET_VOLUME,
    LESSON_INFO_STORAGE_SET_MUTE_STATE,
} from '../constants/lesson-info-storage'

const initialState = {
    volume: undefined,
    muted: undefined,
    lessons : new Map()
};

export default function lessonInfoStorage(state = initialState, action) {

    switch (action.type) {
        case LESSON_INFO_STORAGE_SET_CURRENT_TIME: {
            let _lesson = state.lessons.get(action.payload.id);
            let _currentTime = _lesson ? _lesson.currentTime : 0;
            if (_currentTime !== action.payload.currentTime) {
                state.lessons.set(action.payload.id, {currentTime: action.payload.currentTime})
                return {...state, lessons: state.lessons}
            } else {
                return state
            }
        }

        case LESSON_INFO_STORAGE_SET_VOLUME: {
            if (state.volume !== action.payload) {
                return {...state, volume: action.payload}
            } else {
                return state
            }
        }

        case LESSON_INFO_STORAGE_SET_MUTE_STATE: {
            if (state.muted !== action.payload) {
                return {...state, muted: action.payload}
            } else {
                return state
            }
        }

        default:
            return state;
    }
}