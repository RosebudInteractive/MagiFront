import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import {all, call, put, takeEvery, select,} from "@redux-saga/core/effects";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {DATA_EXPIRATION_TIME} from "../constants/common-consts";

/**
 * Constants
 * */
export const moduleName = 'test-share-result'
const prefix = `${appName}/${moduleName}`

const GET_RESULT_REQUEST = `${prefix}/GET_RESULT_REQUEST`
const GET_RESULT_START = `${prefix}/GET_RESULT_START`
const GET_RESULT_COMPLETED = `${prefix}/GET_RESULT_COMPLETED`
const GET_RESULT_SUCCESS = `${prefix}/GET_RESULT_SUCCESS`
const GET_RESULT_FAIL = `${prefix}/GET_RESULT_FAIL`
const RESULT_NOT_FOUND = `${prefix}/RESULT_NOT_FOUND`

const ResultRecord = Record({
    Code: null,
    Id: null,
    Images: null,
    SnDescription: null,
    SnName: null,
    TestId: null,
    TestInstanceId: null,
    UserId: null
})

const ReducerRecord = Record({
    loading: false,
    saving: false,
    loaded: false,
    shareResult: new ResultRecord(),
    notFound: false,
    lastSuccessTime: null,
    shareUrl: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_RESULT_START:
        case GET_RESULT_COMPLETED:
            return state
                .set('loaded', false)
                .set('loading', true)
                .set('notFound', false)

        case GET_RESULT_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('shareResult', new ResultRecord(payload))
                .set('lastSuccessTime', payload.lastSuccessTime)

        case GET_RESULT_FAIL:
            return state
                .set('loading', false)
                .set('loaded', true)

        case RESULT_NOT_FOUND:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('notFound', true)

        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)
const successTimeSelector = createSelector(stateSelector, state => state.lastSuccessTime)
export const shareResultSelector = createSelector(stateSelector, state => state.shareResult)
export const notFoundSelector = createSelector(stateSelector, state => state.notFound)


/**
 * Action Creators
 * */
export const getShareResult = (code) => {
    return { type: GET_RESULT_REQUEST, payload: code }
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_RESULT_REQUEST, getShareResultSaga),
    ])
}

function* getShareResultSaga(data) {

    let _time = yield select(successTimeSelector),
        _result = yield select(shareResultSelector)

    if (!!_time && ((Date.now() - _time) < DATA_EXPIRATION_TIME) && !!_result && _result.Code === data.payload) {
        yield put({ type: GET_RESULT_COMPLETED })
        return
    }

    yield put({ type: GET_RESULT_START })

    try {
        const _instance = yield call(_fetchGetTestResult, data.payload)

        yield put({type: GET_RESULT_SUCCESS, payload: _instance})
    } catch (e) {
        if (e.status && (e.status === 404)) {
            yield put({ type: RESULT_NOT_FOUND })
        } else {
            yield put({type: GET_RESULT_FAIL, payload: {e}})
            console.error(e)
        }
    }
}

function _fetchGetTestResult(code) {
    return fetch(`/api/tests/instance/share/${code}`, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            return {...data, lastSuccessTime: Date.now()}
        })
}

