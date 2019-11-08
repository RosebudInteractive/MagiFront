import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {all, call, put, takeEvery} from "@redux-saga/core/effects";
import {checkStatus, parseJSON} from "tools/fetch-tools";

/**
 * Constants
 * */
export const moduleName = 'single-test'
const prefix = `${appName}/${moduleName}`

const GET_TEST_REQUEST = `${prefix}/GET_TEST_REQUEST`
const GET_TEST_START = `${prefix}/GET_TEST_START`
const GET_TEST_SUCCESS = `${prefix}/GET_TEST_SUCCESS`
const GET_TEST_FAIL = `${prefix}/GET_TEST_FAIL`

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
    Status: null,
    Cover: null,
    CoverMeta: null,
    URL: null,
    questionsCount: 0,
    estimatedTime: 0,
})

const ReducerRecord = Record({
    loading: false,
    loaded: false,
    test: new TestRecord(),
    questions: new OrderedMap([]),
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
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_TEST_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('test', new TestRecord(payload))
                .set('questions', dataToEntries(payload.Questions, QuestionRecord))

        case GET_TEST_FAIL:
            return state
            .set('loading', false)

        default:
            return state
    }
}

const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new OrderedMap({})
    )
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)
export const testSelector = createSelector(stateSelector, state => state.test)
export const questionsSelector = createSelector(stateSelector, (state) => {
    let _array = state.questions.toArray();

    return _array.map((item, index) => {
        let _item = item.toObject()

        _item.Number = index + 1
        return _item
    })
})


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
    yield put({type: GET_TEST_START})

    try {
        const _test = yield call(_fetchTest, data.payload)

        console.error(_test)

        yield put({type: GET_TEST_SUCCESS, payload: _test})
    } catch (e) {
        console.log(e)
        yield put({ type: GET_TEST_FAIL, payload: {e} })
    }
}

function _fetchTest(url) {
    return fetch(`/api/tests/${url}`, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            if (typeof data.CoverMeta === "string") {
                data.CoverMeta = JSON.parse(data.CoverMeta)
            }

            data.questionsCount = data.Questions.length

            let _estimatedTime = data.Questions.reduce((acc, value) => {
                return acc + value.AnswTime
            }, 0)

            data.estimatedTime = Math.round(_estimatedTime / 60)

            return data
        })
}