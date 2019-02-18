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

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    parameters: new Map(),

})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_PARAMETERS_START:
            return state
                .set('fetching', true)
                .update('parameters', parameters => parameters.clear())

        case GET_PARAMETERS_SUCCESS:
            return state
                .update('parameters', parameters => parameters.merge(payload))
                .set('fetching', false)

        case GET_PARAMETERS_FAIL:
            return state
                .set('fetching', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const parametersSelector = createSelector(stateSelector, state => state.parameters)
export const parametersFetchingSelector = createSelector(stateSelector, state => state.fetching)

export const fixedCourseIdSelector = createSelector(parametersSelector, params => params ? params.get('fixedCourseId'): null)
export const fixedLessonIdSelector = createSelector(parametersSelector, params => params ? params.get('fixedLessonId'): null)
export const fixedObjDescrSelector = createSelector(parametersSelector, params => params.get('fixedObjDescr'))

/**
 * Action Creators
 * */
export const getParameters = () => {
    return (dispatch) => {
        dispatch({
            type: GET_PARAMETERS_START,
            payload: null
        });

        fetch("/api/parameters", {method: 'GET', credentials: 'include'})
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