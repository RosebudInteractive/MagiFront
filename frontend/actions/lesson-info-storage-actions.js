import {
    LESSON_INFO_STORAGE_SET_INIT_STATE,
    LESSON_INFO_STORAGE_SET_CURRENT_TIME,
    LESSON_INFO_STORAGE_SET_VOLUME,
    LESSON_INFO_STORAGE_SET_MUTE_STATE,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_START,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_FAIL,
    LESSON_INFO_STORAGE_UPDATE_DB_START,
    LESSON_INFO_STORAGE_UPDATE_DB_SUCCESS,
    LESSON_INFO_STORAGE_UPDATE_DB_FAIL,
    LESSON_INFO_STORAGE_SET_LESSON_ENDED,
    LESSON_INFO_STORAGE_REFRESH_DB_START,
    LESSON_INFO_STORAGE_REFRESH_DB_SUCCESS,
    LESSON_INFO_STORAGE_REFRESH_DB_FAIL,
    LESSON_INFO_STORAGE_CLEAR_INIT_STATE,
    LESSON_INFO_STORAGE_RESTORE_LESSON,
} from '../constants/lesson-info-storage'

import {checkStatus, parseJSON} from "../tools/fetch-tools";

export const setInitialState = (data) => {
    return {
        type: LESSON_INFO_STORAGE_SET_INIT_STATE,
        payload: data
    }
}

export const clearInitialState = () => {
    return {
        type: LESSON_INFO_STORAGE_CLEAR_INIT_STATE,
        payload: null
    }
}

export const restoreLesson = (lessonId) => {
    return {
        type: LESSON_INFO_STORAGE_RESTORE_LESSON,
        payload: lessonId
    }
}

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

export const setLessonEnded = (data) => {
    return {
        type: LESSON_INFO_STORAGE_SET_LESSON_ENDED,
        payload: data
    }
}

export const loadInitialStateFromDB = (ts) => {
    return (dispatch) => {
        dispatch({
            type: LESSON_INFO_STORAGE_LOAD_FROM_DB_START,
            payload: ts
        });

        fetch("/api/lsnpos", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ts: ts}),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: LESSON_INFO_STORAGE_LOAD_FROM_DB_FAIL,
                    payload: {error}
                });
            });
    }
}

export const updateDbState = (data) => {
    return (dispatch, getState) => {
        dispatch({
            type: LESSON_INFO_STORAGE_UPDATE_DB_START,
            payload: null
        });

        let _ts = getState().lessonInfoStorage.ts,
            _obj = Object.assign({}, data);

        _obj.ts = _ts;

        fetch("/api/lsnpos", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(_obj),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: LESSON_INFO_STORAGE_UPDATE_DB_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: LESSON_INFO_STORAGE_UPDATE_DB_FAIL,
                    payload: {error}
                });
            });
    }
}

export const refreshState = () => {
    return (dispatch, getState) => {
        let _state = getState();

        if (!_state.user.user) { return }

        dispatch({
            type: LESSON_INFO_STORAGE_REFRESH_DB_START,
            payload: null
        });

        let _ts = getState().lessonInfoStorage.ts;


        fetch("/api/lsnpos", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ts: _ts}),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: LESSON_INFO_STORAGE_REFRESH_DB_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: LESSON_INFO_STORAGE_REFRESH_DB_FAIL,
                    payload: {error}
                });
            });
    }
}