import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON, commonGetQuery} from "common-tools/fetch-tools";
import {reset} from "redux-form";
import {all, takeEvery, put, call} from "@redux-saga/core/effects";
import {USER_ROLE} from "../constants/common";
import {showErrorMessage} from "tt-ducks/messages";

/**
 * Constants
 * */
export const moduleName = 'auth'
const prefix = `${appName}/${moduleName}`

const WHO_AM_I_REQUEST = `${prefix}/WHO_AM_I_REQUEST`
const WHO_AM_I_START = `${prefix}/WHO_AM_I_START`
const WHO_AM_I_SUCCESS = `${prefix}/WHO_AM_I_SUCCESS`
const WHO_AM_I_FAIL = `${prefix}/WHO_AM_I_FAIL`

const SIGN_IN_REQUEST = `${prefix}/SIGN_IN_REQUEST`
const SIGN_IN_START = `${prefix}/SIGN_IN_START`
const SIGN_IN_SUCCESS = `${prefix}/SIGN_IN_SUCCESS`
const SIGN_IN_FAIL = `${prefix}/SIGN_IN_FAIL`

const LOGOUT_REQUEST = `${prefix}/LOGOUT_REQUEST`
const LOGOUT_START = `${prefix}/LOGOUT_START`
const LOGOUT_SUCCESS = `${prefix}/LOGOUT_SUCCESS`
const LOGOUT_FAIL = `${prefix}/LOGOUT_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    initialized: false,
    user: null,
    authorized: false,
    loading: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case WHO_AM_I_START:
        case LOGOUT_START:
            return state
                .set('error', null)
                .set('loading', true)

        case SIGN_IN_START:
            return state
                .set('error', null)
                .set('loading', true)
                .set('authorized', false)

        case WHO_AM_I_SUCCESS:
        case SIGN_IN_SUCCESS:
            return state
                .set('loading', false)
                .set('user', payload)
                .set('authorized', true)
                .set('initialized', true)

        case LOGOUT_SUCCESS:
            return state
                .clear()
                .set('initialized', true)

        case WHO_AM_I_FAIL:
            return state
                .set('loading', false)
                .set('authorized', false)
                .set('initialized', true)

        case SIGN_IN_FAIL:
        case LOGOUT_FAIL:
            return state
                .set('loading', false)
                .set('error', payload.error.message)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const userSelector = createSelector(stateSelector, state => state.user)
export const userAuthSelector = createSelector(stateSelector, state => state.authorized)
export const initializedSelector = createSelector(stateSelector, state => state.initialized)
export const hasSupervisorRights = createSelector(userSelector, (user) => {
    return user && user.PData && user.PData.roles && (user.PData.roles.pma || user.PData.roles.pms)
})
export const hasElementEditorRights = createSelector(userSelector, (user) => {
    return user && user.PData && user.PData.roles && (user.PData.roles.pma || user.PData.roles.pms || user.PData.roles.pme)
})
export const hasPmRights = createSelector(userSelector, (user) => {
    return user && user.PData && (
        user.PData.isAdmin ||
        user.PData.roles && (user.PData.roles.pma || user.PData.roles.pms || user.PData.roles.pme || user.PData.roles.pmu)
    )
})
export const userRoleSelector = createSelector(userSelector, (user) => {
    if (user && user.PData && user.PData.roles) {
      return user.PData.isAdmin ?
          USER_ROLE.ADMIN
          :
          user.PData.roles.pma ?
              USER_ROLE.PMA
              :
              user.PData.roles.pms ?
                  USER_ROLE.PMS
                  :
                  user.PData.roles.pme ?
                      USER_ROLE.PME
                      :
                      user.PData.roles.pmu ?
                          USER_ROLE.PMU
                          :
                          null
    } else {
        return null
    }
})

export const hasAdminRights = createSelector(userRoleSelector, (userRole) => {
    return userRole && ((userRole === USER_ROLE.ADMIN) || (userRole === USER_ROLE.PMA))
})

export const errorSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.loading)

/**
 * Action Creators
 * */
export const whoAmI = () => {
    return {type: WHO_AM_I_REQUEST}
}

export const sighIn = (data) => {
    return {type: SIGN_IN_REQUEST, payload: data}
}

export const logout = () => {
    return {type: LOGOUT_REQUEST,}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(WHO_AM_I_REQUEST, whoAmISaga),
        takeEvery(SIGN_IN_REQUEST, sighInSaga),
        takeEvery(LOGOUT_REQUEST, logoutSaga)
    ])
}

const _isPmUser = (data) => {
    let _rights = data.PData;
    return _rights && (_rights.isAdmin || (_rights.roles && (_rights.roles.pma || _rights.roles.pms || _rights.roles.pme || _rights.roles.pmu)))
}

function* whoAmISaga() {
    yield put({type: WHO_AM_I_START})
    try {
        const _authData = yield call(commonGetQuery,"/api/whoami")

        if (_isPmUser(_authData)) {
            yield put({ type: WHO_AM_I_SUCCESS, payload: _authData })
        } else {
            // throw new Error('Not enough rights')
            yield put({ type: WHO_AM_I_FAIL })
        }
    } catch (e) {
        yield put({ type: WHO_AM_I_FAIL, payload: {e}})
    }
}

function* sighInSaga({payload}) {

    yield put({ type: SIGN_IN_START });

    try {
        const _authData = yield call(_postLogin, payload)
        if (_isPmUser(_authData)) {
            yield put({ type: SIGN_IN_SUCCESS, payload: _authData })
        } else {
            throw new Error('Недостаточно прав')
        }

    } catch (e) {
        yield put({ type: SIGN_IN_FAIL, payload: {error: e}})
        yield put(showErrorMessage(e.message))
    }
}

const _postLogin = (values) => {
    return fetch("/api/login", {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(values),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* logoutSaga() {
    yield put({type: LOGOUT_START})
    try {
        yield call(commonGetQuery,"/api/logout")

        yield put({ type: LOGOUT_SUCCESS })
    } catch (e) {
        yield put({ type: LOGOUT_FAIL, payload: {e}})
    }
}
