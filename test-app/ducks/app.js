import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {all, takeEvery, put, call, select, fork,} from 'redux-saga/effects'
import {commonGetQuery} from "common-tools/fetch-tools";

/**
 * Constants
 * */
export const moduleName = 'app'
const prefix = `${appName}/${moduleName}`

const GET_OPTIONS_REQUEST = `${prefix}/GET_OPTIONS_REQUEST`
const GET_OPTIONS_START = `${prefix}/GET_OPTIONS_START`
const GET_OPTIONS_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
const GET_OPTIONS_FAIL = `${prefix}/GET_OPTIONS_FAIL`

const WHO_AM_I_REQUEST = `${prefix}/WHO_AM_I_REQUEST`
const WHO_AM_I_START = `${prefix}/WHO_AM_I_START`
const WHO_AM_I_SUCCESS = `${prefix}/WHO_AM_I_SUCCESS`
const WHO_AM_I_FAIL = `${prefix}/WHO_AM_I_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    tokenGuardEnable: true,
    user: null,
    authorized: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_OPTIONS_START:
        case WHO_AM_I_START:
            return state
                .set('fetching', true)

        case GET_OPTIONS_SUCCESS:
            return state
                .set('fetching', false)
                .set('tokenGuardEnable', false)

        case GET_OPTIONS_FAIL:
            return state
                .set('fetching', false)
                .set('tokenGuardEnable', false)

        case WHO_AM_I_SUCCESS:
            return state
                .set('fetching', false)
                .set('user', payload)
                .set('authorized', true)

        case WHO_AM_I_FAIL:
            return state
                .set('loading', false)
                .set('user', null)
                .set('authorized', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const tokenGuardEnable = createSelector(stateSelector, state => state.tokenGuardEnable)
export const userSelector = createSelector(stateSelector, state => state.user)
export const userAuthorized = createSelector(stateSelector, state => state.authorized)

/**
 * Action Creators
 * */
export const getAppOptions = (token) => {
    return {type: GET_OPTIONS_REQUEST, payload: {token: token}}
}

export const whoAmI = () => {
    return {type: WHO_AM_I_REQUEST}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_OPTIONS_REQUEST, getOptionsSaga),
        takeEvery(WHO_AM_I_REQUEST, whoAmISaga),
    ])
}

function* getOptionsSaga({payload}) {
    yield put({type: GET_OPTIONS_START})
    try {
        yield call(fetchOptions, payload.token)

        yield put({type: GET_OPTIONS_SUCCESS,})

    } catch (error) {
        yield put({type: GET_OPTIONS_FAIL, payload: {error}})
    }
}

const fetchOptions = (token) => {
    const _url = "/api/options" + (token ? `?token=${token}` : "")

    return fetch(_url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* whoAmISaga() {
    yield put({type: WHO_AM_I_START})
    try {
        const _authData = yield call(commonGetQuery,"/api/whoami")

        yield put({ type: WHO_AM_I_SUCCESS, payload: _authData })

    } catch (e) {
        yield put({ type: WHO_AM_I_FAIL, payload: {e}})
    }
}
