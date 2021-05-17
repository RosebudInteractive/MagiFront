import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON, commonGetQuery} from "common-tools/fetch-tools";
import {reset} from "redux-form";
import {all, takeEvery, put, call} from "@redux-saga/core/effects";
import {USER_ROLE} from "../constants/common";

/**
 * Constants
 * */
export const moduleName = 'auth'
const prefix = `${appName}/${moduleName}`

const WHO_AM_I_REQUEST = `${prefix}/WHO_AM_I_REQUEST`
const WHO_AM_I_START = `${prefix}/WHO_AM_I_START`
const WHO_AM_I_SUCCESS = `${prefix}/WHO_AM_I_SUCCESS`
const WHO_AM_I_FAIL = `${prefix}/WHO_AM_I_FAIL`

export const SIGN_IN_START = `${prefix}/SIGN_IN_START`
export const SIGN_IN_SUCCESS = `${prefix}/SIGN_IN_SUCCESS`
export const SIGN_IN_FAIL = `${prefix}/SIGN_IN_FAIL`

export const LOGOUT_START = `${prefix}/LOGOUT_START`
export const LOGOUT_SUCCESS = `${prefix}/LOGOUT_SUCCESS`
export const LOGOUT_FAIL = `${prefix}/LOGOUT_FAIL`

export const CLEAR_ERROR = `${prefix}/CLEAR_ERROR`

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

        case CLEAR_ERROR:
            return state
                .set('error', null)

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

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(WHO_AM_I_REQUEST, whoAmISaga)
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

export const login = (values) => {
    return (dispatch) => {

        dispatch({
            type: SIGN_IN_START,
            payload: null
        });

        fetch("/api/login", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(values),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                if (_isPmUser(data)) {
                    dispatch({
                        type: SIGN_IN_SUCCESS,
                        payload: data
                    });

                    dispatch(reset('SignInForm'));
                } else {
                    throw new Error('Not enough rights')
                }
            })
            .catch((error) => {
                dispatch({
                    type: SIGN_IN_FAIL,
                    payload: {error}
                });
            });
    }
}

export const clearError = () => {
    return {
        type: CLEAR_ERROR,
        payload: null
    };
}

export const logout = () => {
    return (dispatch) => {

        dispatch({
            type: LOGOUT_START,
            payload: null
        });

        fetch("/api/logout", {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: LOGOUT_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: LOGOUT_FAIL,
                    payload: {error}
                });
            });
    }
}

