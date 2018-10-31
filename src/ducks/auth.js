import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {reset} from "redux-form";

/**
 * Constants
 * */
export const moduleName = 'auth'
const prefix = `${appName}/${moduleName}`

export const WHO_AM_I_START = `${prefix}/WHO_AM_I_START`
export const WHO_AM_I_SUCCESS = `${prefix}/WHO_AM_I_SUCCESS`
export const WHO_AM_I_FAIL = `${prefix}/WHO_AM_I_FAIL`

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

export const errorSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.loading)

/**
 * Action Creators
 * */

const _isUserAdmin = (data) => {
    let _rights = data.PData;
    return _rights && (_rights.isAdmin || (_rights.roles && _rights.roles.e))
}

export const whoAmI = () => {
    return (dispatch) => {

        dispatch({
            type: WHO_AM_I_START,
            payload: null
        });

        fetch("/api/whoami", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                if (_isUserAdmin(data)) {
                    dispatch({
                        type: WHO_AM_I_SUCCESS,
                        payload: data
                    });
                } else {
                    throw new Error('Not enough rights')
                }
            })
            .catch((error) => {
                dispatch({
                    type: WHO_AM_I_FAIL,
                    payload: {error}
                });
            });
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
                if (_isUserAdmin(data)) {
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

        fetch("/api/logout", {credentials: 'include'})
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

