import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import {all, takeEvery, put, select, call} from "@redux-saga/core/effects";

import {commonGetQuery} from "common-tools/fetch-tools";
import {showError} from "tt-ducks/messages";
/**
 * Constants
 * */
export const moduleName = 'app'
const prefix = `${appName}/${moduleName}`

const HIDE_SIDE_BAR_MENU = `${prefix}/HIDE_SIDE_BAR_MENU`
const SHOW_SIDE_BAR_MENU = `${prefix}/SHOW_SIDE_BAR_MENU`
const CHANGE_PROCESS_ROTATION = `${prefix}/CHANGE_PROCESS_ROTATION`

const GET_OPTIONS_REQUEST = `${prefix}/GET_OPTIONS_REQUEST`
const GET_OPTIONS_START = `${prefix}/GET_OPTIONS_START`
const GET_OPTIONS_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
const GET_OPTIONS_FAIL = `${prefix}/GET_OPTIONS_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    sideBarMenuVisible: true,
    horizontalProcess: true,
    reCapture: '',
    fetching: false
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
                .set('fetching', false)

        case GET_OPTIONS_FAIL:
            return state
                .set('reCapture', '')
                .set('fetching', false)

        case HIDE_SIDE_BAR_MENU:
            return state
                .set("sideBarMenuVisible", false)
        case SHOW_SIDE_BAR_MENU:
            return state
                .set("sideBarMenuVisible", true)

        case CHANGE_PROCESS_ROTATION:
            return state
                .set("horizontalProcess", !state.get("horizontalProcess"))

        default:
            return state
    }
}

/**
 * Selectors
 * */

const stateSelector = state => state[moduleName]
export const sideBarMenuVisible = createSelector(stateSelector, state => state.sideBarMenuVisible)
export const horizontalProcess = createSelector(stateSelector, state => state.horizontalProcess)
export const reCaptureSelector = createSelector(stateSelector, state => state.reCapture)
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)

/**
 * Action Creators
 * */
export const hideSideBarMenu = () => {
    return {type: HIDE_SIDE_BAR_MENU}
}

export const showSideBarMenu = () => {
    return {type: SHOW_SIDE_BAR_MENU}
}

export const changeProcessRotation = () => {
    return {type: CHANGE_PROCESS_ROTATION}
}

export const getAppOptions = () => {
    return {type: GET_OPTIONS_REQUEST}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_OPTIONS_REQUEST, getAppOptionsSaga)
    ])
}

function* getAppOptionsSaga() {
    yield put({ type: GET_OPTIONS_START });

    try {
        const _result = yield call(commonGetQuery, "/api/options")
        yield put({type: GET_OPTIONS_SUCCESS, payload: _result})
    } catch (e) {
        yield put({type: GET_OPTIONS_FAIL, payload: e})
        yield put(showError({content: e.message}))
    }
}


