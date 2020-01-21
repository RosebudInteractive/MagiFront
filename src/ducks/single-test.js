import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, parseJSON, getErrorMessage} from "../tools/fetch-tools";
import {SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, put, call, select} from 'redux-saga/effects'
import {reset} from "redux-form";
import {EDIT_TEST_REQUEST} from "adm-ducks/test-list";

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

export const RELOAD_COURSE_INFO_REQUEST = `${prefix}/RELOAD_COURSE_INFO_REQUEST`
export const BACK_TO_COURSE_REQUEST = `${prefix}/BACK_TO_COURSE_REQUEST`

export const GET_TEST_TYPES_START = `${prefix}/GET_TEST_TYPES_START`
export const GET_TEST_TYPES_SUCCESS = `${prefix}/GET_TEST_TYPES_SUCCESS`
export const GET_TEST_TYPES_FAIL = `${prefix}/GET_TEST_TYPES_FAIL`

export const INSERT_TEST_REQUEST = `${prefix}/INSERT_TEST_REQUEST`
export const INSERT_TEST_START = `${prefix}/INSERT_TEST_START`
export const INSERT_TEST_SUCCESS = `${prefix}/INSERT_TEST_SUCCESS`
export const INSERT_TEST_FAIL = `${prefix}/INSERT_TEST_FAIL`

export const UPDATE_TEST_REQUEST = `${prefix}/UPDATE_TEST_REQUEST`
export const UPDATE_TEST_START = `${prefix}/UPDATE_TEST_START`
export const UPDATE_TEST_SUCCESS = `${prefix}/UPDATE_TEST_SUCCESS`
export const UPDATE_TEST_FAIL = `${prefix}/UPDATE_TEST_FAIL`

/**
 * Reducer
 * */
const TestRecord = Record({
    Id: null,
    TestTypeId: null,
    CourseId: null,
    LessonId: null,
    IsAuthRequired: null,
    Name: null,
    Method: null,
    MaxQ: 0,
    FromLesson: false,
    IsTimeLimited: false,
    Status: null,
    Cover: null,
    CoverMeta: null,
    URL: null,
    Images: [],
    SnName: null,
    SnDescription: null,
    SnPost: null,
})

const ReducerRecord = Record({
    loading: false,
    loaded: false,
    saving: false,
    selected: null,
    test: new TestRecord(),
    questions: new OrderedMap([]),
    testTypes: new OrderedMap([]),
})

const TypeRecord = Record({
    Id: null,
    Name: null,
})


const QuestionRecord = Record({
    Id: null,
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
                .set('test', new TestRecord(payload))
                .set('questions', dataToEntries(payload.Questions, QuestionRecord))

        case CREATE_NEW_TEST_SUCCESS:
            return state
                .set('loading', false)
                .set('test', new TestRecord(payload))
                .update('questions', questions => questions.clear())

        case GET_TEST_FAIL:
        case GET_TEST_TYPES_FAIL:
            return state
                .set('loading', false)
                .set('loaded', false)

        case GET_TEST_TYPES_SUCCESS:
            return state
                .set('testTypes', dataToEntries(payload, TypeRecord))

        case INSERT_TEST_START:
        case UPDATE_TEST_START:
            return state
                .set('saving', true)

        case INSERT_TEST_SUCCESS:
        case INSERT_TEST_FAIL:
        case UPDATE_TEST_SUCCESS:
        case UPDATE_TEST_FAIL:
            return state
                .set('saving', false)

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
export const savingSelector = createSelector(stateSelector, state => state.saving)
export const testSelector = createSelector(stateSelector, state => state.test)
export const typesSelector = createSelector(stateSelector, (state) => {
    let _array = state.testTypes.toArray();

    return _array.map((item) => {
        let _item = item.toObject()

        _item.id = _item.Id
        return _item
    })
})
export const questionsSelector = createSelector(stateSelector, (state) => {
    let _array = state.questions.toArray();

    return _array.map((item, index) => {
        let _item = item.toObject()

        _item.id = _item.Id
        _item.Number = index + 1
        return _item
    })
})

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

export const insertTest = (test) => {
    return {type: INSERT_TEST_REQUEST, payload: test}
}

export const updateTest = (test) => {
    return {type: UPDATE_TEST_REQUEST, payload: test}
}

export const backToCourse = (courseId) => {
    return {type: BACK_TO_COURSE_REQUEST, payload: courseId}
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
        yield put({type: GET_TEST_TYPES_SUCCESS, payload: Object.values(_types)})
    } catch (e) {
        yield put({ type: GET_TEST_TYPES_FAIL, payload: {e} })

        const _message = yield call(getErrorMessage, e)
        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

function _fetchTestTypes() {
    return fetch('/api/adm/tests/types', {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* insertTestSaga(data) {
    yield put({type: INSERT_TEST_START})

    try {
        const _courseId = data.payload.CourseId
        const _newData = yield call(_postTest, data.payload)

        console.log(_newData)

        yield put({type: INSERT_TEST_SUCCESS})

        yield put(reset('TestEditor'))
        yield put({type: EDIT_TEST_REQUEST, payload: {courseId: _courseId, testId: _newData.id}})
    } catch (e) {
        yield put({ type: INSERT_TEST_FAIL })

        const _message = yield call(getErrorMessage, e)
        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _postTest = (data) => {
    return fetch("/api/adm/tests", {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* getTestSaga(data) {
    yield put({type: GET_TEST_START})

    try {
        yield call(getTestTypesSaga)
        const _test = yield call(_fetchTest, data.payload)
        yield put({type: GET_TEST_SUCCESS, payload: _test})
    } catch (e) {
        yield put({ type: GET_TEST_FAIL, payload: {e} })

        const _message = yield call(getErrorMessage, e)
        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

function _fetchTest(id) {
    return fetch(`/api/adm/tests/${id}`, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* backToCourseSaga(data) {
    yield call(closeEditorSaga, data.payload)
}

function* closeEditorSaga(courseId) {
    yield put(replace(`/adm/courses/edit/${courseId}`))
}

function* updateTestSaga(data) {
    yield put({type: UPDATE_TEST_START})

    try {
        const _testId = data.payload.Id

        yield call(_putTest, data.payload)
        yield put({type: UPDATE_TEST_SUCCESS})

        yield put(reset('TestEditor'))
        yield put({type: GET_TEST_REQUEST, payload: _testId})
    } catch (e) {
        yield put({ type: UPDATE_TEST_FAIL })

        const _message = yield call(getErrorMessage, e)
        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _putTest = (data) => {
    return fetch(`/api/adm/tests/${data.Id}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

export const saga = function* () {
    yield all([
        takeEvery(GET_TEST_REQUEST, getTestSaga),
        takeEvery(CREATE_NEW_TEST_REQUEST, createNewTestSaga),
        takeEvery(INSERT_TEST_REQUEST, insertTestSaga),
        takeEvery(UPDATE_TEST_REQUEST, updateTestSaga),
        takeEvery(BACK_TO_COURSE_REQUEST, backToCourseSaga),
        ]
    )}


const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new OrderedMap({})
    )
}