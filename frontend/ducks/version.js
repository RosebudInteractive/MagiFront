import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, } from 'immutable'
import {checkStatus, parseJSON} from "../tools/fetch-tools";

/**
 * Constants
 * */
export const moduleName = 'version'
const prefix = `${appName}/${moduleName}`

export const LOAD_START = `${prefix}/LOAD_START`
export const LOAD_SUCCESS = `${prefix}/LOAD_SUCCESS`
export const LOAD_FAIL = `${prefix}/LOAD_FAIL`

export const CHECK_START = `${prefix}/CHECK_START`
export const CHECK_SUCCESS = `${prefix}/CHECK_SUCCESS`
export const CHECK_FAIL = `${prefix}/CHECK_FAIL`

const StorePopupItem = Record({
    visible: false,
    link: null
})

const StorePopupRecord = Record({
    ios: new StorePopupItem(),
    android: new StorePopupItem()
})

const PopupRecord = Record({
    storePopup: new StorePopupRecord(),
    sale2021: new Record({ visible: false })
})
/**
 * Reducer
 * */
export const ReducerRecord = Record({
    main: 0,
    loading: false,
    error: null,
    popup: new PopupRecord()
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case LOAD_START:
        case CHECK_START:
            return state
                .set('loading', true)
                .set('error', null)

        case LOAD_SUCCESS:
        case CHECK_SUCCESS:
            return state
                .set('loading', false)
                .set('main', payload.main)
                .set('popup', new PopupRecord(payload.popup))

        case LOAD_FAIL:
        case CHECK_FAIL:
            return state
                .set('loading', false)
                .set('error', payload.error)

        default:
            return state
    }
}

export const stateSelector = state => state[moduleName]
export const appVersionSelector = createSelector(stateSelector, state => state.main)
export const popupSelector = createSelector(stateSelector, state => state.popup)

/**
 * Action Creators
 * */
export const loadVersion = () => {
    return (dispatch) => {
        dispatch({
            type: LOAD_START,
            payload: null
        });

        fetch('/static/version.json')
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: LOAD_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_FAIL,
                    payload: {error}
                });
            });
    }
}

export const checkVersion = () => {
    return (dispatch) => {
        dispatch({
            type: CHECK_START,
            payload: null
        });

        fetch('/static/version.json')
            .then(checkStatus)
            .then(parseJSON)
            .then((data) => {
                dispatch({
                    type: CHECK_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: CHECK_FAIL,
                    payload: {error}
                });
            });
    }
}