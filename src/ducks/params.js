import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";

/**
 * Constants
 * */
export const moduleName = 'params'
const prefix = `${appName}/${moduleName}`

export const GET_PARAMETERS_START = `${prefix}/GET_PARAMETERS_START`
export const GET_PARAMETERS_SUCCESS = `${prefix}/GET_PARAMETERS_SUCCESS`
export const GET_PARAMETERS_FAIL = `${prefix}/GET_PARAMETERS_FAIL`

export const SET_FIXED_COURSE = `${prefix}/SET_FIXED_COURSE`
export const CLEAR_FIXED_COURSE = `${prefix}/CLEAR_FIXED_COURSE`
export const SET_FIXED_LESSON = `${prefix}/SET_FIXED_LESSON`
export const CLEAR_FIXED_LESSON = `${prefix}/CLEAR_FIXED_LESSON`
export const SET_FIXED_OBJECT_DESCR = `${prefix}/SET_FIXED_OBJECT_DESCR`

export const SAVE_PARAMETERS_START = `${prefix}/SAVE_PARAMETERS_START`
export const SAVE_PARAMETERS_SUCCESS = `${prefix}/SAVE_PARAMETERS_SUCCESS`
export const SAVE_PARAMETERS_FAIL = `${prefix}/SAVE_PARAMETERS_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    needSave: false,
    parameters: new Map(),

})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_PARAMETERS_START:
            return state
                .set('fetching', true)
                .update('parameters', parameters => parameters.clear())
                .set('needSave', false)

        case GET_PARAMETERS_SUCCESS:
            return state
                .update('parameters', parameters => parameters.merge(payload))
                .set('needSave', false)
                .set('fetching', false)

        case GET_PARAMETERS_FAIL:
            return state
                .set('fetching', false)
                .set('needSave', false)

        case SET_FIXED_COURSE:
            return state
                .set('needSave', true)
                .update('parameters', (params) => {
                    if (params.has('fixedCourseId')) {
                        return params.update('fixedCourseId', fixedCourseId => fixedCourseId.merge(payload))
                    } else {
                        let _obj = {}
                        _obj[payload.Key] = payload
                        return params.merge(_obj)
                    }
                })

        case CLEAR_FIXED_COURSE:
            return state
                .set('needSave', true)
                .setIn(['parameters', 'fixedCourseId', 'Value'], null)

        case SET_FIXED_OBJECT_DESCR:
            return state
                .set('needSave', true)
                .update('parameters', (params) => {
                    if (params.has('fixedObjDescr')) {
                        return params.update('fixedObjDescr', fixedObjDescr => fixedObjDescr.merge(payload))
                    } else {
                        let _obj = {}
                        _obj[payload.Key] = payload
                        return params.merge(_obj)
                    }
                })

        case SET_FIXED_LESSON:
            return state
                .set('needSave', true)
                .update('parameters', (params) => {
                    if (params.has('fixedLessonId')) {
                        return params.update('fixedLessonId', fixedLessonId => fixedLessonId.merge(payload))
                    } else {
                        let _obj = {}
                        _obj[payload.Key] = payload
                        return params.merge(_obj)
                    }
                })

        case CLEAR_FIXED_LESSON:
            return state
                .set('needSave', true)
                .setIn(['parameters', 'fixedLessonId', 'Value'], null)

        case SAVE_PARAMETERS_SUCCESS:
            return state
                .setIn(['parameters', 'needSave'], false)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const parametersSelector = createSelector(stateSelector, state => state.parameters)
export const parametersFetchingSelector = createSelector(stateSelector, state => state.parameters.get('fetching'))

export const fixedCourseIdSelector = createSelector(parametersSelector, params => params ? params.getIn(['fixedCourseId', 'Value']): null)
export const fixedLessonIdSelector = createSelector(parametersSelector, params => params ? params.getIn(['fixedLessonId', 'Value']): null)
export const fixedObjDescrSelector = createSelector(parametersSelector, params => params.getIn(['fixedObjDescr', 'Value']))

/**
 * Action Creators
 * */
export const getParameters = () => {
    return (dispatch) => {
        dispatch({
            type: GET_PARAMETERS_START,
            payload: null
        });

        fetch("/api/adm/parameters", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {

                let _map = {}
                data.forEach((item) => {
                    _map[item.Key] = item
                })

                dispatch({
                    type: GET_PARAMETERS_SUCCESS,
                    payload: _map
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_PARAMETERS_FAIL,
                    payload: err
                });
            });
    }
}

export const setFixedCourse = (data) => {
    return (dispatch, getState) => {
        let _state = getState()

        let _courseParam = _state['params'].parameters.get('fixedCourseId'),
            _courseId = _state['params'].parameters.getIn(['fixedCourseId', 'Value']),
            _lessonId = _state['params'].parameters.getIn(['fixedLessonId', 'Value']),
            _descrParam = _state['params'].parameters.get('fixedObjDescr'),
            _descr = _state['params'].parameters.getIn(['fixedObjDescr', 'Value'])

        let _needSave = (
            (!_courseId && data.active) ||
            ((_courseId === data.courseId) && ((data.description !== _descr) || !data.active))
        )

        if (_needSave) {
            let _newCourseParam = _courseId ? _courseParam.toJS() : {};
            _newCourseParam.Key = 'fixedCourseId';
            _newCourseParam.Tp = 1;
            _newCourseParam.Value = data.active ? data.courseId : null

            dispatch({
                type: SET_FIXED_COURSE,
                payload: _newCourseParam
            });

            if (_lessonId) {
                dispatch({
                    type: CLEAR_FIXED_LESSON,
                    payload: null
                });
            }


            _setFixedDescr(_descrParam, data, dispatch);
        }
    }
}

export const setFixedLesson = (data) => {
    return (dispatch, getState) => {
        let _state = getState()

        let _courseId = _state['params'].parameters.getIn(['fixedCourseId', 'Value']),
            _lessonId = _state['params'].parameters.getIn(['fixedLessonId', 'Value']),
            _lessonParam = _state['params'].parameters.get('fixedLessonId'),
            _descrParam = _state['params'].parameters.get('fixedObjDescr'),
            _descr = _state['params'].parameters.getIn(['fixedObjDescr', 'Value'])

        let _needSave = (
            (!_lessonId && data.active) ||
            (_lessonId && (_lessonId !== data.lessonId)) ||
            ((_lessonId === data.lessonId) && ((data.description !== _descr) || !data.active))
        )

        if (_needSave) {
            let _newLessonParam = _lessonId ? _lessonParam.toJS() : {};
            _newLessonParam.Key = 'fixedLessonId';
            _newLessonParam.Tp = 1;
            _newLessonParam.Value = data.active ? data.lessonId : null

            dispatch({
                type: SET_FIXED_LESSON,
                payload: _newLessonParam
            });

            if (_courseId) {
                dispatch({
                    type: CLEAR_FIXED_COURSE,
                    payload: null
                });
            }


            _setFixedDescr(_descrParam, data, dispatch);
        }
    }
}

const _setFixedDescr = (param, data, dispatch) => {
    let _newParam = (param && param.get('Value')) ? param.toJS() : {};

    _newParam.Key = 'fixedObjDescr';
    _newParam.Tp = 0;
    _newParam.Value = data.active ? data.description : null

    dispatch({
        type: SET_FIXED_OBJECT_DESCR,
        payload: _newParam
    });
}

export const saveParameters = () => {
    return (dispatch, getState) => {
        let _state = getState()

        if (_state['params'].needSave) {

            dispatch({
                type: SAVE_PARAMETERS_START,
                payload: null
            });

            let _values = _state['params'].parameters.toJSON()

            let _array = Object.values(_values);

            fetch("/api/adm/parameters", {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(_array),
                credentials: 'include'
            })
                .then(checkStatus)
                .then(parseJSON)
                .then(() => {
                    dispatch({
                        type: SAVE_PARAMETERS_SUCCESS,
                        payload: null
                    });
                })
                .catch((err) => {
                    dispatch({
                        type: SAVE_PARAMETERS_FAIL,
                        payload: err
                    });
                });
        }

    }
}

