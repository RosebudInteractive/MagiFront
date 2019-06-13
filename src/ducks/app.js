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

export const SET_ACTIVE_TAB = `${prefix}/SET_ACTIVE_TAB`


const Mode = Record({course: false, subscription: false})

const Billing = Record({
    mode: new Mode()
})
/**
 * Reducer
 * */
export const ReducerRecord = Record({
    reCapture: '',
    enableButtons: true,
    activeTabs: new Map(),
    billing: new Billing(),
    fetching: false,
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_OPTIONS_START:
            return state
                .set('fetching', true)

        case GET_OPTIONS_SUCCESS:
            return state
                .set('reCapture', payload.siteKey.reCapture)
                .set('billing', new Billing(payload.billing))
                .set('fetching', false)

        case GET_OPTIONS_FAIL:
            return state
                .set('reCapture', '')
                .set('fetching', false)

        case DISABLE_BUTTONS:
            return state
                .set('enableButtons', false)

        case ENABLE_BUTTONS:
            return state
                .set('enableButtons', true)

        case SET_ACTIVE_TAB:
            return state
                .setIn(['activeTabs', payload.page], payload.value)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const reCaptureSelector = createSelector(stateSelector, state => state.reCapture)
export const enableButtonsSelector = createSelector(stateSelector, state => state.enableButtons)
export const activeTabsSelector = createSelector(stateSelector, state => state.activeTabs)
export const billingModeSelector = createSelector(stateSelector, state => state.getIn(['billing', 'mode']))

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

export const setActiveTab = (value) => {
    return {
        type: SET_ACTIVE_TAB,
        payload: value
    }
}

