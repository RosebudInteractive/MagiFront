import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import {all, call, put, takeEvery, select} from "@redux-saga/core/effects";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {GET_CONCRETE_COURSE_REQUEST} from "actions/courses-page-actions";
import {DATA_EXPIRATION_TIME} from "../constants/common-consts";

/**
 * Constants
 * */
export const moduleName = 'test-header'
const prefix = `${appName}/${moduleName}`

export const GET_TEST_REQUEST = `${prefix}/GET_TEST_REQUEST`
const GET_TEST_START = `${prefix}/GET_TEST_START`
const GET_TEST_SUCCESS = `${prefix}/GET_TEST_SUCCESS`
export const GET_TEST_COMPLETED = `${prefix}/GET_TEST_COMPLETED`
export const GET_TEST_FAIL = `${prefix}/GET_TEST_FAIL`


const TestRecord = Record({
    Id: null,
    TestTypeId: null,
    CourseId: null,
    CourseName: null,
    CourseURL: null,
    LessonId: null,
    LsnName: null,
    LsnURL: null,
    Name: null,
    Status: null,
    Cover: null,
    CoverMeta: null,
    URL: null,
    Images: [],
    SnName: null,
    SnDescription: null,
    SnPost: null,
    questionsCount: 0,
    estimatedTime: 0,
})

const ReducerRecord = Record({
    loading: false,
    loaded: false,
    test: new TestRecord(),
    lastSuccessTime: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_TEST_START:
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_TEST_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('test', new TestRecord(payload))
                .set('lastSuccessTime', payload.lastSuccessTime)

        case GET_TEST_FAIL:
            return state
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
const successTimeSelector = createSelector(stateSelector, state => state.lastSuccessTime)
export const testSelector = createSelector(stateSelector, state => state.test)

/**
 * Action Creators
 * */
export const getTest = (testUrl) => {
    return {type: GET_TEST_REQUEST, payload: testUrl}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_TEST_REQUEST, getTestSaga),
    ])
}

function* getTestSaga(data) {
    let _time = yield select(successTimeSelector)

    if (!!_time && ((Date.now() - _time) < DATA_EXPIRATION_TIME)) {
        yield put({type: GET_TEST_COMPLETED})
        return
    }

    yield put({type: GET_TEST_START})

    try {
        const _test = yield call(_fetchTest, `/api/tests/${data.payload}`)

        yield put({type: GET_CONCRETE_COURSE_REQUEST, payload: _test.CourseURL})

        yield put({type: GET_TEST_SUCCESS, payload: _test})
        yield put({type: GET_TEST_COMPLETED})
    } catch (e) {
        yield put({ type: GET_TEST_FAIL, payload: {e} })
    }
}

function _fetchTest(url) {
    return fetch(url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            if (typeof data.CoverMeta === "string") {
                data.CoverMeta = JSON.parse(data.CoverMeta)
            }

            data.questionsCount = data.Questions.length

            data.estimatedTime = Math.round(data.AnswTime / 60)
            data.lastSuccessTime = Date.now()

            return data
        })
}