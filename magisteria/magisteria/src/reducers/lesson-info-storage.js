import {
    LESSON_INFO_STORAGE_SET_INIT_STATE,
    LESSON_INFO_STORAGE_SET_CURRENT_TIME,
    LESSON_INFO_STORAGE_SET_VOLUME,
    LESSON_INFO_STORAGE_SET_MUTE_STATE,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_START,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS,
    LESSON_INFO_STORAGE_UPDATE_DB_SUCCESS,
    LESSON_INFO_STORAGE_SET_LESSON_ENDED,
    LESSON_INFO_STORAGE_REFRESH_DB_SUCCESS,
    LESSON_INFO_STORAGE_CLEAR_INIT_STATE, LESSON_INFO_STORAGE_RESTORE_LESSON,
} from '../constants/lesson-info-storage'

const initialState = {
    volume: undefined,
    muted: undefined,
    lessons : new Map(),
    ts: 0,
};

export default function lessonInfoStorage(state = initialState, action) {

    switch (action.type) {
        case LESSON_INFO_STORAGE_CLEAR_INIT_STATE: {
            return {...state, volume: 0.3,
                muted: false,
                lessons : new Map(),
                ts: 0,}
        }

        case LESSON_INFO_STORAGE_RESTORE_LESSON: {
            let _lesson = state.lessons.get(action.payload);
            let _currentTime = _lesson ? _lesson.currentTime : 0;
            if (_currentTime !== 0) {
                let _newMap = state.lessons;
                _newMap.set(action.payload, {currentTime : 0, isFinished: false})
                return {...state, lessons: _newMap}
            } else {
                return state
            }
        }

        case LESSON_INFO_STORAGE_SET_INIT_STATE: {
            if (!action.payload) {
                return {...state, volume: 0.3,
                    muted: false,
                    lessons : new Map(),
                    ts: 0,}
            } else {
                action.payload.forEach((value, key) => {
                    state.lessons.set(key, Object.assign({}, value))
                })
                return {...state, lessons: state.lessons}
            }
        }

        case LESSON_INFO_STORAGE_SET_CURRENT_TIME: {
            let _lesson = state.lessons.get(action.payload.id);
            let _currentTime = _lesson ? _lesson.currentTime : 0;
            if (_currentTime !== action.payload.currentTime) {

                let _obj = {currentTime : action.payload.currentTime, isFinished: action.payload.isFinished}

                if (action.payload.needSetTS) {
                    _obj.ts = Date.now()
                }

                state.lessons.set(action.payload.id, _obj)
                return {...state, lessons: state.lessons}
            } else {
                return state
            }
        }

        case LESSON_INFO_STORAGE_SET_LESSON_ENDED: {
            let _lesson = state.lessons.get(action.payload.id);
            let _isFinished = _lesson ? _lesson.isFinished : false
            if (!_isFinished) {
                let _newLessonState = Object.assign({}, _lesson);

                _newLessonState.isFinished = true;

                state.lessons.set(action.payload.id, _newLessonState)
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

        case LESSON_INFO_STORAGE_LOAD_FROM_DB_START: {
            return {...state, ts: action.payload}
        }

        case LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS:
        case LESSON_INFO_STORAGE_UPDATE_DB_SUCCESS:
        case LESSON_INFO_STORAGE_REFRESH_DB_SUCCESS: {
            return {...state, ts: action.payload.ts}
        }

        default:
            return state;
    }
}