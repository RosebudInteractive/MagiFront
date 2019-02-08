import {
    LESSON_INFO_STORAGE_CLEAR_INIT_STATE,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_FAIL,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_START,
    LESSON_INFO_STORAGE_LOAD_FROM_DB_SUCCESS,
    LESSON_INFO_STORAGE_REFRESH_DB_FAIL,
    LESSON_INFO_STORAGE_REFRESH_DB_START,
    LESSON_INFO_STORAGE_REFRESH_DB_SUCCESS,
    LESSON_INFO_STORAGE_RESTORE_LESSON,
    LESSON_INFO_STORAGE_SET_CURRENT_TIME,
    LESSON_INFO_STORAGE_SET_INIT_STATE,
    LESSON_INFO_STORAGE_SET_LESSON_ENDED,
    LESSON_INFO_STORAGE_SET_MUTE_STATE,
    LESSON_INFO_STORAGE_SET_VOLUME,
    LESSON_INFO_STORAGE_UPDATE_DB_FAIL,
    LESSON_INFO_STORAGE_UPDATE_DB_START,
    LESSON_INFO_STORAGE_UPDATE_DB_SUCCESS,
} from '../constants/lesson-info-storage'

import {checkStatus, parseJSON} from "../tools/fetch-tools";
import $ from "jquery";

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
    return (dispatch, getState) => {
        dispatch({
            type: LESSON_INFO_STORAGE_LOAD_FROM_DB_START,
            payload: ts
        });

        let _fetch = _getFetchObject(getState(), {ts: ts});

        fetch(_fetch.input, _fetch.init)
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

        let _obj = Object.assign({}, data);
        _obj.ts = getState().lessonInfoStorage.ts;

        let _fetch = _getFetchObject(getState(), _obj);

        fetch(_fetch.input, _fetch.init)
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
        let _fetch = _getFetchObject(getState(), {ts: _ts});

        fetch(_fetch.input, _fetch.init)
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

const _getFetchObject = (state, params) => {
    let _state = state.app,
        _isDebug = _state.debug && _state.debug.lsnPositions,
        _input = (_isDebug) ? _getDebugLsnPosPath(state, params) : '/api/lsnpos',
        _method = (_isDebug) ? 'GET' : 'POST',
        _init = {
            method: _method,
            headers: {
                "Content-type": "application/json"
            },
            credentials: 'include'
        }

    if (!_isDebug) {
        _init.body = JSON.stringify(params);
    }

    return {input: _input, init: _init}
}

const _getDebugLsnPosPath = (state, params) => {
    let _params = {
        userId: state.user.user.Id,
        ts: params.ts,
    }

    let _lessonId = (params && params.lsn && typeof (params.lsn) === 'object') ? Object.keys(params.lsn)[0] : null;
    if (_lessonId) {
        _params.lessonId = _lessonId

        if (params.lsn[_lessonId].pos) {
            _params.pos = params.lsn[_lessonId].pos
        }

        if (params.lsn[_lessonId].dt) {
            _params.dt = params.lsn[_lessonId].dt
            if (_params.dt < 0) {
                console.error(`lsnpos : negative value [${_params.dt}]`)
            }
        }

        if (params.lsn[_lessonId].r) {
            _params.r = params.lsn[_lessonId].r
        }
    }

    _params.ver = '2.0'

    // console.log(`lsnpos ${$.param(_params)}`)
    return '/api/lsnposdbg?' + $.param(_params)
}

