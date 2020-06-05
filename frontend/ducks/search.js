import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {all, call, put, takeEvery} from "@redux-saga/core/effects";
import {MOCK_DATA} from "../mock-data/search/result"
import {push} from 'react-router-redux'

/**
 * Constants
 * */
export const moduleName = 'search'
const prefix = `${appName}/${moduleName}`

const SEARCH_REQUEST = `${prefix}/SEARCH_REQUEST`
const SEARCH_START = `${prefix}/SEARCH_START`
const SEARCH_SUCCESS = `${prefix}/SEARCH_SUCCESS`
const SEARCH_FAIL = `${prefix}/SEARCH_FAIL`

const CLEAR_SEARCH_RESULTS = `${prefix}/CLEAR_SEARCH_RESULTS`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    query: null,
    result: []
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case SEARCH_REQUEST:
            return state
                .set('query', payload)

        case CLEAR_SEARCH_RESULTS:
            return state
                .set('query', null)
                .set('result', [])

        case SEARCH_START:
            return state
                .set('fetching', true)

        case SEARCH_SUCCESS:
            return state
                .set('fetching', false)
                .set('result', payload)

        case SEARCH_FAIL:
            return state
                .set('fetching', false)
                .set('result', [])

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const resultSelector = createSelector(stateSelector, state => state.result)
export const isEmptySelector = createSelector(resultSelector, result => result.length === 0)

/**
 * Action Creators
 * */
export const search = (data) => {
    let _query = data && data.trim()

    if (_query) {
        return {type: SEARCH_REQUEST, payload: _query}
    }
}

export const clear = () => {
    return {type: CLEAR_SEARCH_RESULTS}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(SEARCH_REQUEST, searchSaga)
    ])
}

function* searchSaga(data) {
    yield put({type: SEARCH_START})

    try {
        yield put(push("/search"))

        let _result = yield call(_postSearch, data.payload)

        yield put({type: SEARCH_SUCCESS, payload: _result})
        // yield put({type: SEARCH_SUCCESS, payload: MOCK_DATA.COMMON_RESULTS})

    } catch (e) {
        yield put({ type: SEARCH_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        console.log(_message)
        // yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _postSearch = (query) => {
    return fetch("/api/adm/search", {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            query: query
        }),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}
