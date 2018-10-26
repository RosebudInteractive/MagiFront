import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
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

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    reCapture: '',
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

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const reCaptureSelector = createSelector(stateSelector, state => state.reCapture)

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

