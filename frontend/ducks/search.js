import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {all, call, put, takeEvery, select} from "@redux-saga/core/effects";
import {MOCK_DATA} from "../mock-data/search/result"
import {push} from 'react-router-redux'
import $ from "jquery";

/**
 * Constants
 * */
export const moduleName = 'search'
const prefix = `${appName}/${moduleName}`

const SEARCH_REQUEST = `${prefix}/SEARCH_REQUEST`
const SEARCH_START = `${prefix}/SEARCH_START`
const SEARCH_SUCCESS = `${prefix}/SEARCH_SUCCESS`
const SEARCH_FAIL = `${prefix}/SEARCH_FAIL`

const SET_PAGE_REQUEST = `${prefix}/SET_PAGE_REQUEST`
const SET_PAGE_START = `${prefix}/SET_PAGE_START`
const SET_PAGE_SUCCESS = `${prefix}/SET_PAGE_SUCCESS`
const SET_PAGE_FAIL = `${prefix}/SET_PAGE_FAIL`

const CLEAR_SEARCH_RESULTS = `${prefix}/CLEAR_SEARCH_RESULTS`

const ITEMS_ON_PAGE = 10

/**
 * Reducer
 * */

const PagesRecord = Record({
    count: 0,
    currentPage: 1,
})

export const ReducerRecord = Record({
    fetching: false,
    query: null,
    result: [],
    pages: new PagesRecord()
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case SEARCH_REQUEST:
            return state
                .set('query', payload.q)
                .set('pages', new PagesRecord())

        case CLEAR_SEARCH_RESULTS:
            return state
                .set('query', null)
                .set('result', [])
                .set('pages', new PagesRecord())

        case SEARCH_START:
            return state
                .set('fetching', true)

        case SEARCH_SUCCESS:
            return state
                .set('fetching', false)
                .set('result', payload.result)
                .setIn(['pages', 'count'], payload.pageCount)
                .setIn(['pages', 'currentPage'], payload.currentPage)

        case SEARCH_FAIL:
            return state
                .set('fetching', false)
                .set('result', [])

        case SET_PAGE_SUCCESS:
            return state
                .setIn(['pages', 'currentPage'], payload)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const resultSelector = createSelector(stateSelector, (state) => {
    const _currentPage = state.pages.currentPage,
        _start = (_currentPage - 1) * ITEMS_ON_PAGE,
        _end = (_currentPage * ITEMS_ON_PAGE)

    return state.result.slice(_start, _end)
})

export const countSelector = createSelector(stateSelector, state => state.result.length)
export const querySelector = createSelector(stateSelector, result => result.query)
export const pagesSelector = createSelector(stateSelector, result => result.pages)

/**
 * Action Creators
 * */
export const search = (data) => {
    let _query = data && data.query && data.query.trim()

    if (_query) {
        return { type: SEARCH_REQUEST, payload: {q: _query, p: data.page ? data.page : 1} }
    }
}

export const clear = () => {
    return {type: CLEAR_SEARCH_RESULTS}
}

export const setPageNumber = (number) => {
    return {type: SET_PAGE_REQUEST, payload: number}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(SEARCH_REQUEST, searchSaga),
        takeEvery(SET_PAGE_REQUEST, setPageSaga),
    ])
}

function* searchSaga(data) {
    yield put({type: SEARCH_START})

    try {
        const _params = $.param(data.payload)

        yield put(push(`/search?${_params}`))

        let _result = yield call(_postSearch, data.payload.q),
            _pageCount = Math.ceil(_result.length / ITEMS_ON_PAGE),
            _current = data.payload.p <= _pageCount ? data.payload.p : 1

        yield put({type: SEARCH_SUCCESS, payload: {result: _result, pageCount: _pageCount, currentPage: _current}})
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


function* setPageSaga(data) {
    const pages = yield select(pagesSelector),
        _query = yield select(querySelector),
        _count = pages.count,
        _current = pages.currentPage

    if ((data.payload !== _current) && (data.payload <= _count)) {
        const _params = $.param({q:_query, p:data.payload})
        yield put(push(`/search?${_params}`))
        yield put({type: SET_PAGE_SUCCESS, payload: data.payload})
    }


}
