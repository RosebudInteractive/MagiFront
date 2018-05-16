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
} from '../constants/lesson-info-storage'

import {checkStatus, parseJSON} from "../tools/fetch-tools";

export const setInitialState = (data) => {
    return {
        type: LESSON_INFO_STORAGE_SET_INIT_STATE,
        payload: data
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

export const loadInitialStateFromDB = () => {
    return (dispatch) => {
        dispatch({
            type: LESSON_INFO_STORAGE_LOAD_FROM_DB_START,
            payload: null
        });

        fetch("/api/lsnpos", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ts:0}),
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