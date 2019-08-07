import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, put, call, select} from 'redux-saga/effects'

/**
 * Constants
 * */
export const moduleName = 'test-list'
const prefix = `${appName}/${moduleName}`

export const GET_TESTS_REQUEST = `${prefix}/GET_TESTS_REQUEST`
export const GET_TESTS_START = `${prefix}/GET_TESTS_START`
export const GET_TESTS_SUCCESS = `${prefix}/GET_TESTS_SUCCESS`
export const GET_TESTS_FAIL = `${prefix}/GET_TESTS_FAIL`

export const CREATE_NEW_TEST_REQUEST = `${prefix}/CREATE_NEW_TEST_REQUEST`
export const EDIT_TEST_REQUEST = `${prefix}/EDIT_TEST_REQUEST`

/**
 * Reducer
 * */
const ReducerRecord = Record({
    loading: false,
    loaded: false,
    selected: null,
    hasChanges: false,
    entries: new OrderedMap([])
})

const TestRecord = Record({
    Id: null,
    Name: null,
    Method: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_TESTS_START:
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_TESTS_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, TestRecord))

        case GET_TESTS_FAIL:
            return state
                .set('loaded', false)
                .set('loading', false)

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

const entriesSelector = createSelector(stateSelector, state => state.entries)

/**
 * Action Creators
 * */
export const getTests = (courseId) => {
    return {type: GET_TESTS_REQUEST, payload: courseId}
}

export const createNewTest = (courseId) => {
    return {type: CREATE_NEW_TEST_REQUEST, payload: courseId}
}

export const editTest = (courseId, testId) => {
    return {type: EDIT_TEST_REQUEST, payload: {courseId: courseId, testId: testId}}
}

function* getTestSaga(data) {
    yield put({type: GET_TESTS_START})

    try {
        const _tests = yield call(_fetchTests, data.payload)

        yield put({type: GET_TESTS_SUCCESS, payload: _tests})
    } catch (e) {
        yield put({ type: GET_TESTS_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _fetchTests = (courseId) => {
    const _url = courseId ? `/api/tests/${courseId}` : "/api/tests"

    return fetch(_url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* createTestSaga(data) {
    yield put(replace(`/adm/courses/edit/${data.courseId}/tests/edit/${data.testId}`))
}

function* editTestSaga(courseId) {
    yield put(replace(`/adm/courses/edit/${courseId}/tests/new`))
}

export const saga = function* () {
    yield all([
        takeEvery(GET_TESTS_REQUEST, getTestSaga),
        takeEvery(CREATE_NEW_TEST_REQUEST, createTestSaga),
        takeEvery(EDIT_TEST_REQUEST, editTestSaga),
    ])
}


const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new OrderedMap({})
    )
}