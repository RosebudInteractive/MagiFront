import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, put, call, select} from 'redux-saga/effects'
import {GET_TESTS_FAIL, GET_TESTS_REQUEST} from "adm-ducks/test-list";

/**
 * Constants
 * */
export const moduleName = 'single-test'
const prefix = `${appName}/${moduleName}`

export const GET_TEST_REQUEST = `${prefix}/GET_TEST_REQUEST`
export const GET_TEST_START = `${prefix}/GET_TEST_START`
export const GET_TEST_SUCCESS = `${prefix}/GET_TEST_SUCCESS`
export const GET_TEST_FAIL = `${prefix}/GET_TEST_FAIL`

export const CREATE_NEW_TEST_REQUEST = `${prefix}/CREATE_NEW_TEST_REQUEST`
export const CREATE_NEW_TEST_START = `${prefix}/CREATE_NEW_TEST_START`
export const CREATE_NEW_TEST_SUCCESS = `${prefix}/CREATE_NEW_TEST_SUCCESS`
export const CREATE_NEW_TEST_FAIL = `${prefix}/CREATE_NEW_TEST_FAIL`

export const RELOAD_COURSE_INFO_REQUEST = `${prefix}/RELOAD_COURSE_INFO_REQUEST`

export const GET_TEST_TYPES_START = `${prefix}/GET_TEST_TYPES_START`
export const GET_TEST_TYPES_SUCCESS = `${prefix}/GET_TEST_TYPES_SUCCESS`
export const GET_TEST_TYPES_FAIL = `${prefix}/GET_TEST_TYPES_FAIL`


/**
 * Reducer
 * */
const TestRecord = Record({
    Id: null,
    TestTypeId: null,
    CourseId: null,
    LessonId: null,
    Name: null,
    Method: null,
    MaxQ: 0,
    FromLesson: false,
    IsTimeLimited: false,
})

const ReducerRecord = Record({
    loading: false,
    loaded: false,
    selected: null,
    hasChanges: false,
    test: new TestRecord(),
    questions: new OrderedMap([]),
    testTypes: new OrderedMap([])
})

const TypeRecord = Record({
    Id: null,
    Name: null,
})


const QuestionRecord = Record({
    AnswTime: null,
    Text: null,
    Picture: null,
    PictureMeta: null,
    AnswType: null,
    Score: null,
    StTime: null,
    EndTime: null,
    AllowedInCourse: null,
    AnswBool: null,
    AnswInt: null,
    AnswText: null,
    CorrectAnswResp: null,
    WrongAnswResp: null,
    Answers: [],
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_TEST_START:
        case GET_TEST_TYPES_START:
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_TEST_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, TestRecord))

        case CREATE_NEW_TEST_SUCCESS:
            return state
                .set('loading', false)
                // .set('loaded', true)
                .set('test', new TestRecord(payload))

        case GET_TEST_FAIL:
        case GET_TEST_TYPES_FAIL:
            return state
                .set('loading', false)
                .set('loaded', false)

        case GET_TEST_TYPES_SUCCESS:
            return state
                .set('testTypes', dataToEntries(payload, TypeRecord))

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
export const testSelector = createSelector(stateSelector, state => state.test)

/**
 * Action Creators
 * */
export const getTest = (testId) => {
    return {type: GET_TEST_REQUEST, payload: testId}
}

export const createTest = (initObject) => {
    return {type: CREATE_NEW_TEST_REQUEST, payload: initObject}
}

export const getCourseLessons = (courseId) => {
    return {type: RELOAD_COURSE_INFO_REQUEST, payload: courseId}
}

export const createNewQuestion = (courseId) => {

}

export const editQuestion = (courseId, testId) => {

}


/**
 * Sagas
 */
function* createNewTestSaga(data) {
    yield put({type: CREATE_NEW_TEST_START})
    yield call(getTestTypesSaga)
    yield put({type: CREATE_NEW_TEST_SUCCESS, payload: data.payload})
}

function* getTestTypesSaga() {
    yield put({type: GET_TEST_TYPES_START})

    try {
        const _types = yield call(_fetchTestTypes)
        yield put({type: GET_TEST_TYPES_SUCCESS, payload: _types})
    } catch (e) {
        yield put({ type: GET_TEST_TYPES_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

function _fetchTestTypes() {
    return fetch('/api/adm/tests/types', {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

export const saga = function* () {
    yield all([
        takeEvery(CREATE_NEW_TEST_REQUEST, createNewTestSaga),
        ]
    )}


const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new OrderedMap({})
    )
}