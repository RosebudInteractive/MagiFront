import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";

/**
 * Constants
 * */
export const moduleName = 'app'
const prefix = `${appName}/${moduleName}`

export const GET_OPTIONS_START = `${prefix}/GET_OPTIONS_START`
export const GET_OPTIONS_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
export const GET_OPTIONS_FAIL = `${prefix}/GET_OPTIONS_FAIL`

export const GET_PARAMETERS_START = `${prefix}/GET_PARAMETERS_START`
export const GET_PARAMETERS_SUCCESS = `${prefix}/GET_PARAMETERS_SUCCESS`
export const GET_PARAMETERS_FAIL = `${prefix}/GET_PARAMETERS_FAIL`

export const SET_FIXED_COURSE = `${prefix}/SET_FIXED_COURSE`
export const SET_FIXED_LESSON = `${prefix}/SET_FIXED_LESSON`

export const SAVE_PARAMETERS_START = `${prefix}/SAVE_PARAMETERS_START`
export const SAVE_PARAMETERS_SUCCESS = `${prefix}/SAVE_PARAMETERS_SUCCESS`
export const SAVE_PARAMETERS_FAIL = `${prefix}/SAVE_PARAMETERS_FAIL`

export const DISABLE_BUTTONS = `${prefix}/DISABLE_BUTTONS`
export const ENABLE_BUTTONS = `${prefix}/ENABLE_BUTTONS`


const Params = Record({needSave: false, list: new Map()})
/**
 * Reducer
 * */
export const ReducerRecord = Record({
    reCapture: '',
    enableButtons: false,
    parameters: new Params(),
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_OPTIONS_SUCCESS:
            return state
                .set('reCapture', payload.siteKey.reCapture)

        case GET_OPTIONS_FAIL:
            return state
                .set('reCapture', '')

        case DISABLE_BUTTONS:
            return state
                .set('enableButtons', false)

        case ENABLE_BUTTONS:
            return state
                .set('enableButtons', true)

        case GET_PARAMETERS_START:
        case GET_PARAMETERS_FAIL:
            return state
                .updateIn(['parameters', 'list'], parameters => parameters.clear())
                .setIn(['parameters', 'needSave'], false)

        case GET_PARAMETERS_SUCCESS:
            return state
                .updateIn(['parameters', 'list'], parameters => parameters.concat(payload))
                .setIn(['parameters', 'needSave'], false)

        case SET_FIXED_COURSE:
            return state
                .setIn(['parameters', 'needSave'], true)
                .setIn(['parameters', 'list', 'fixedCourseId'], payload.courseId)
                // .updateIn(['parameters', 'list'], params => {
                //     if (params.has('fixedLessonId')) {
                //         params.set('fixedLessonId', null)
                //     }
                // })
                .setIn(['parameters', 'list', 'fixedObjDescr'], payload.descr)

        case SET_FIXED_LESSON:
            return state
                .setIn(['parameters', 'needSave'], true)
                // .updateIn(['parameters', 'list'] , (params) => {
                //     if (params.has('fixedLessonId'))
                // }, payload.lessonId)
                // .updateIn(['parameters', 'list'], params => {
                //     if (params.has('fixedCourseId')) {
                //         params.set('fixedCourseId', null)
                //     }
                // })
                // .setIn(['parameters', 'list', 'fixedObjDescr'], payload.descr)

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
export const reCaptureSelector = createSelector(stateSelector, state => state.reCapture)
export const enableButtonsSelector = createSelector(stateSelector, state => state.enableButtons)
export const parametersSelector = createSelector(stateSelector, state => state.parameters.get('list'))
export const fixedCourseIdSelector = createSelector(parametersSelector, params => params.get('fixedCourseId'))
export const fixedLessonIdSelector = createSelector(parametersSelector, params => params.get('fixedLessonId'))
export const fixedObjDescrSelector = createSelector(parametersSelector, params => params.get('fixedObjDescr'))

/**
 * Action Creators
 * */
export const getAppOptions = () => {
    return (dispatch) => {
        dispatch({
            type: GET_OPTIONS_START,
            payload: null
        });

        fetch("/api/options", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: GET_OPTIONS_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_OPTIONS_FAIL,
                    payload: err
                });
            });
    }
}

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
                dispatch({
                    type: GET_PARAMETERS_SUCCESS,
                    payload: data
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

export const setFixedObject = (data) => {
    return (dispatch, getState) => {
        let _state = getState()

        let _courseId = _state['app'].parameters.getIn(['list', 'fixedCourseId']),
            _lessonId = _state['app'].parameters.getIn(['list', 'fixedLessonId']),
            _descr = _state['app'].parameters.get(['list', 'fixedObjDescr'])

        if (data.hasOwnProperty('courseId')) {
            if ((!_courseId && !_lessonId || (data.courseId === _courseId)) && (!data.active || (data.description !== _descr))) {
                dispatch({
                    type: SET_FIXED_COURSE,
                    payload: {
                        courseId: data.active ? data.courseId : null,
                        descr: data.active ? data.description : null
                    }
                });
            }
        }


        if (data.hasOwnProperty('lessonId')) {
            if ((!_courseId && !_lessonId  || (data.lessonId === _lessonId)) && (!data.active || (data.description !== _descr))) {
                dispatch({
                    type: SET_FIXED_LESSON,
                    payload: {
                        lessonId: data.active ? data.lessonId : null,
                        descr: data.active ? data.description : null
                    }
                });
            }
        }

    }
}

export const saveParameters = () => {
    return (dispatch, getState) => {
        let _state = getState()

        if (_state['app'].parameters.get('needSave')) {

            dispatch({
                type: SAVE_PARAMETERS_START,
                payload: null
            });

            let _values = _state['app'].parameters.get('list').toJSON()

            let _array = Object.entries(_values);

            // for (let key in _values) {
            //     _array.push({[key] : _values[key]})
            // }

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

export const disableButtons = () => {
    return {
        type: DISABLE_BUTTONS,
        payload: null
    }
}

export const enableButtons = () => {
    return {
        type: ENABLE_BUTTONS,
        payload: null
    }
}

