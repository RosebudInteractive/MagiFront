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

export const DISABLE_BUTTONS = `${prefix}/DISABLE_BUTTONS`
export const ENABLE_BUTTONS = `${prefix}/ENABLE_BUTTONS`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    reCapture: '',
    enableButtons: true,
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

/**
 * Action Creators
 * */
export const getAppOptions = () => {
    return (dispatch) => {
        dispatch({
            type: GET_OPTIONS_START,
            payload: null
        });

        fetch("/api/options", {method: 'GET', credentials: 'include'})
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

