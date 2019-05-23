import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import {FINISH_LOAD_PROFILE} from "ducks/profile";
import {all, takeEvery, select, put, call,} from 'redux-saga/effects'
import {SHOW_SIGN_IN_FORM} from "../constants/user";
import {CLEAR_WAITING_AUTHORIZE,} from "ducks/app";

/**
 * Constants
 * */
export const moduleName = 'player_ver_2'
const prefix = `${appName}/${moduleName}`

export const UNLOCK_LESSON_REQUEST = `${prefix}/UNLOCK_LESSON_REQUEST`
export const SET_WAITING_AUTHORIZE = `${prefix}/SET_WAITING_AUTHORIZE`
export const REDIRECT_TO_UNLOCKED_LESSON= `${prefix}/REDIRECT_TO_UNLOCKED_LESSON`
export const REDIRECT_COMPLETE= `${prefix}/REDIRECT_COMPLETE`

const Redirect = Record({url: '', active: false})
const Waiting = Record({data: null, active: false})

export const ReducerRecord = Record({
    redirect: new Redirect(),
    waiting: new Waiting(),
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case SET_WAITING_AUTHORIZE:
            return state
                .setIn(['waiting', 'data'], Object.assign({}, payload))
                .setIn(['waiting', 'active'], true)

        case CLEAR_WAITING_AUTHORIZE:
            return state
                .setIn(['waiting', 'data'], null)
                .setIn(['waiting', 'active'], false)

        case REDIRECT_TO_UNLOCKED_LESSON: {
            return state
                .setIn(['redirect', 'url'], payload)
                .setIn(['redirect', 'active'], true)
        }

        case REDIRECT_COMPLETE: {
            return state
                .setIn(['redirect', 'url'], '')
                .setIn(['redirect', 'active'], false)
        }

        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
const redirectSelector = createSelector(stateSelector, state => state.redirect)

export const isRedirectActiveSelector = createSelector(redirectSelector, redirect => redirect.get('active'))
export const redirectUrlSelector = createSelector(redirectSelector, redirect => redirect.get('url'))

const waitingAuth = createSelector(stateSelector, state => state.waiting)
export const isWaitingAuthorize = createSelector(waitingAuth, waiting => waiting.active)
export const waitingDataSelector = createSelector(waitingAuth, (waiting) => {
    return waiting.active ? waiting.data : null
})


/**
 * Action Creators
 * */
export const unlockLesson = (data) => {
    return { type : UNLOCK_LESSON_REQUEST, payload: data }
}

export const setWaitingAuthorizeData = (data) => {
    return {type: SET_WAITING_AUTHORIZE, payload: data}
}

export const completeRedirect = () => {
    return { type: REDIRECT_COMPLETE }
}



/**
 * Sagas
 */
function* unlockLessonSaga(data) {
    const _state = yield select(state => state),
        _authorized = !!_state.user.user;

    console.log(data)

    if (!_authorized) {
        yield call(_setWaitingAuthorize, data.payload)
    }
}

function* _setWaitingAuthorize(data) {
    yield put({type: SET_WAITING_AUTHORIZE, payload: data})
    yield put({type: SHOW_SIGN_IN_FORM})
}

function* onFinishLoadProfileSaga() {
    const _waiting = yield select(waitingAuth)

    console.log(_waiting)

    if (_waiting.active && _waiting.data && (_waiting.data.returnUrl)) {
        yield put({type: REDIRECT_TO_UNLOCKED_LESSON, payload: _waiting.data.returnUrl})
        yield put({type: CLEAR_WAITING_AUTHORIZE})
        yield put({type: REDIRECT_COMPLETE})
    }
}

export const saga = function* () {
    yield all([
        takeEvery(UNLOCK_LESSON_REQUEST, unlockLessonSaga),
        takeEvery(FINISH_LOAD_PROFILE, onFinishLoadProfileSaga),
    ])
}