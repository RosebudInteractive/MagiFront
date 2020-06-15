import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {all, call, put, takeEvery, select} from "@redux-saga/core/effects";
import {MOCK_DATA} from "../mock-data/search/result"
import {push} from 'react-router-redux'
import $ from "jquery";
import {SEARCH_SORT_TYPE} from "../constants/common-consts";

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

const SET_SORT_TYPE_REQUEST = `${prefix}/SET_SORT_TYPE_REQUEST`
const SET_SORT_TYPE_START = `${prefix}/SET_SORT_TYPE_START`
const SET_SORT_TYPE_FAIL = `${prefix}/SET_SORT_TYPE_FAIL`

const CLEAR_SEARCH_RESULTS = `${prefix}/CLEAR_SEARCH_RESULTS`

const ITEMS_PER_PAGE = 10

/**
 * Reducer
 * */

const PagesRecord = Record({
    count: 0,
    currentPage: 1,
    loaded: false,
})

const PartitionRecord = Record({
    first: 0,
    last: 0,
    count: ITEMS_PER_PAGE
})

export const ReducerRecord = Record({
    fetching: false,
    query: null,
    sort: SEARCH_SORT_TYPE.BY_RELEVANCY,
    result: [],
    count: 0,
    pages: new PagesRecord(),
    partition: new PartitionRecord()
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case SEARCH_REQUEST:
            return state
                .set('query', payload.query)
                .set('count', 0)
                .set('pages', new PagesRecord())
                .set('partition', new PartitionRecord())
                .set('sort', SEARCH_SORT_TYPE.BY_RELEVANCY)

        case CLEAR_SEARCH_RESULTS:
            return state
                .set('query', null)
                .set('result', [])
                .set('count', 0)
                .set('pages', new PagesRecord())
                .set('partition', new PartitionRecord())
                .set('sort', SEARCH_SORT_TYPE.BY_RELEVANCY)

        case SEARCH_START:
        case SET_PAGE_START:
        case SET_SORT_TYPE_START:
            return state
                .set('fetching', true)

        case SEARCH_SUCCESS:
            return state
                .set('fetching', false)
                .set('result', payload.result)
                .update('count', count => payload.count ? payload.count : count)
                .update('sort', sort => payload.sort ? payload.sort : sort)
                .update('pages', pages => {
                    if (!pages.loaded && payload.pageCount) {
                        return pages
                            .set('count', payload.pageCount)
                            .set('currentPage', (payload.currentPage && payload.currentPage <= payload.pageCount) ? payload.currentPage : 1)
                            .set('loaded', true)
                    } else if (payload.currentPage) {
                        return pages
                            .set('currentPage', (payload.currentPage <= pages.count) ? payload.currentPage : 1)
                    } else {
                        return pages
                    }
                })
                .update('partition', partition =>
                    partition
                        .set('first', payload.first)
                        .set('last', payload.last)
                        .set('count', payload.nextQuerySize)
                )

        case SEARCH_FAIL:
        case SET_PAGE_FAIL:
        case SET_SORT_TYPE_FAIL:
            return state
                .set('fetching', false)
                .set('result', [])

        case SET_PAGE_SUCCESS:
            return state
                .set('fetching', false)
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
        _partition = state.partition

    let _start = (_currentPage - 1) * ITEMS_PER_PAGE - _partition.first,
        _end = (_currentPage * ITEMS_PER_PAGE)

    _end = (_end <= (_partition.last + 1)) ? _end - _partition.first : (_partition.last + 1) - _partition.first

    return state.result.slice(_start, _end)
})

export const countSelector = createSelector(stateSelector, state => state.count)
export const querySelector = createSelector(stateSelector, result => result.query)
export const pagesSelector = createSelector(stateSelector, result => result.pages)
const partitionSelector = createSelector(stateSelector, result => result.partition)
export const sortTypeSelector = createSelector(stateSelector, result => result.sort)

/**
 * Action Creators
 * */
export const search = (data) => {
    let _query = data && data.query && data.query.trim()

    if (_query) {
        const _params = {
            query: _query,
            page: data.page ? data.page : 1,
        }

        if (data.sort && (data.sort !== SEARCH_SORT_TYPE.BY_RELEVANCY)) {
            _params.sort = data.sort
        }

        return { type: SEARCH_REQUEST, payload: _params }
    }
}

export const clear = () => {
    return {type: CLEAR_SEARCH_RESULTS}
}

export const setPageNumber = (number) => {
    return {type: SET_PAGE_REQUEST, payload: number}
}

export const setSortType = (value) => {
    return {type: SET_SORT_TYPE_REQUEST, payload: value}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(SEARCH_REQUEST, searchSaga),
        takeEvery(SET_PAGE_REQUEST, setPageSaga),
        takeEvery(SET_SORT_TYPE_REQUEST, setSortTypeSaga),
    ])
}

function* searchSaga(data) {
    yield put({type: SEARCH_START})

    try {
        const {addressBar, query, currentPage, currentSort} = yield call(_createQuery, data.payload)

        yield put(push(`/search?${addressBar}`))

        const _q = yield call(_postSearch, query),
        // const _q = MOCK_DATA.COURSE,
            _resultObject = {
                result: _q.hits,
                first: query.from,
                last: (_q.hits.length - 1) + query.from,
                nextQuerySize: ITEMS_PER_PAGE,
                currentPage: currentPage,
                sort: currentSort,
            }

        if (query.withCount) {
            _resultObject.count = _q.count
            _resultObject.pageCount = Math.ceil(_q.count / ITEMS_PER_PAGE)
        }

        yield put({type: SEARCH_SUCCESS, payload: _resultObject})
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
    }
}

const _postSearch = (query) => {
    return fetch("/api/search", {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(query),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* setPageSaga(data) {
    yield put({type: SET_PAGE_START})

    try {
        const {addressBar, needRequest, query, currentPage, currentSort} = yield call(_createQuery, {page: data.payload})

        if (needRequest) {
            yield put(push(`/search?${addressBar}`))

            const _q = yield call(_postSearch, query),
                _resultObject = {
                    result: _q.hits,
                    first: query.from,
                    last: (_q.hits.length - 1) + query.from,
                    nextQuerySize: ITEMS_PER_PAGE,
                    currentPage: currentPage,
                    sort: currentSort,
                }

            yield put({type: SEARCH_SUCCESS, payload: _resultObject})
        } else {
            yield put(push(`/search?${addressBar}`))
            yield put({type: SET_PAGE_SUCCESS, payload: data.payload})
        }
    } catch (e) {
        yield put({ type: SET_PAGE_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        console.log(_message)
    }
}

function* setSortTypeSaga(data) {
    yield put({type: SET_SORT_TYPE_START})

    try {
        const {addressBar, needRequest, query, currentPage, currentSort} = yield call(_createQuery, {sort: data.payload})

        if (needRequest) {
            yield put(push(`/search?${addressBar}`))

            const _q = yield call(_postSearch, query),
                _resultObject = {
                    result: _q.hits,
                    first: query.from,
                    last: (_q.hits.length - 1) + query.from,
                    nextQuerySize: ITEMS_PER_PAGE,
                    currentPage: currentPage,
                    sort: currentSort,
                }

            yield put({type: SEARCH_SUCCESS, payload: _resultObject})
        } else {
            yield put(push(`/search?${addressBar}`))
            yield put({type: SET_PAGE_SUCCESS, payload: data.payload})
        }
    } catch (e) {
        yield put({ type: SET_SORT_TYPE_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        console.log(_message)
    }
}

function* _createQuery(params) {
    const _currentQuery = yield select(querySelector),
        _pages = yield select(pagesSelector),
        _partition = yield select(partitionSelector),
        _currentSort = yield select(sortTypeSelector)

    const _queryValue = params.query ? params.query : _currentQuery,
        _pageNumber = params.page ? params.page : 1,
        _withCount = !_pages.loaded,
        _sort = params.sort ? params.sort : _currentSort

    const _addressBar = {
        q: _queryValue,
        p: _pageNumber
    }
    if (_sort.value) { _addressBar.s = _sort.name }

    const _from = (_pageNumber - 1) * ITEMS_PER_PAGE,
        _needRequest = !(_pages.loaded && (_from < _partition.last) && (_from >= _partition.first) && (_sort.name === _currentSort.name))

    const _query = {
        query: _queryValue,
        from: _from,
        size: _partition.count,
    }

    if (_withCount) { _query.withCount = true }
    if (_sort.value) { _query.sort = _sort.value }

    return {addressBar: $.param(_addressBar), needRequest : _needRequest, query: _query, currentPage: _pageNumber, currentSort: _sort}
}
