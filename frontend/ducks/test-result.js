import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import {all, call, put, takeEvery, select,} from "@redux-saga/core/effects";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {getTest,} from "ducks/test";
import {DATA_EXPIRATION_TIME} from "../constants/common-consts";
import {isAnswerCorrect} from "tools/tests-tools";

/**
 * Constants
 * */
export const moduleName = 'test-result'
const prefix = `${appName}/${moduleName}`

const GET_TEST_RESULT_REQUEST = `${prefix}/GET_TEST_RESULT_REQUEST`
const GET_TEST_RESULT_START = `${prefix}/GET_TEST_RESULT_START`
const GET_TEST_RESULT_COMPLETED = `${prefix}/GET_TEST_RESULT_COMPLETED`
const GET_TEST_RESULT_SUCCESS = `${prefix}/GET_TEST_RESULT_SUCCESS`
const GET_TEST_RESULT_FAIL = `${prefix}/GET_TEST_RESULT_FAIL`

const ResultRecord = Record({
    ActDuration: 0,
    Duration: 0,
    Id: null,
    IsFinished: false,
    IsVisible: true,
    MaxScore: 0,
    Score: 0,
    StTime: null,
    TestId: null,
    UserId: null,
    CorrectCount: 0,
    TotalCount: 0,
})

const ReducerRecord = Record({
    loading: false,
    saving: false,
    loaded: false,
    testResult: new ResultRecord(),
    questions: new Map([]),
    lastSuccessTime: null,
})

const QuestionRecord = Record({
    AnswTime: null,
    Answer: null,
    Question: null,
    Score: null,
    IsCorrect: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_TEST_RESULT_START:
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_TEST_RESULT_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('testResult', new ResultRecord(payload))
                .set('questions', dataToEntries(payload.Questions, QuestionRecord))
                .set('lastSuccessTime', payload.lastSuccessTime)

        case GET_TEST_RESULT_FAIL:
            return state
                .set('loading', false)

        default:
            return state
    }
}

const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Question.Id, new DataRecord(value)),
        new Map({})
    )
}


/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)
const successTimeSelector = createSelector(stateSelector, state => state.lastSuccessTime)
export const testResultSelector = createSelector(stateSelector, state => state.testResult)
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
export const getTestResult = (testId) => {
    return { type: GET_TEST_RESULT_REQUEST, payload: testId }
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_TEST_RESULT_REQUEST, getTestResultSaga),
    ])
}

function* getTestResultSaga(data) {

    let _time = yield select(successTimeSelector),
        _instance = yield select(testResultSelector)

    if (!!_time && ((Date.now() - _time) < DATA_EXPIRATION_TIME) && !!_instance && _instance.Id === data.payload) {
        yield put({ type: GET_TEST_RESULT_COMPLETED })
        return
    }

    yield put({ type: GET_TEST_RESULT_START })

    try {
        const _instance = yield call(_fetchGetTestResult, data.payload)

        yield put(getTest(_instance.TestId))

        yield put({type: GET_TEST_RESULT_SUCCESS, payload: _instance})
    } catch (e) {
        yield put({ type: GET_TEST_RESULT_FAIL, payload: {e} })
        console.error(e)
    }
}

function _fetchGetTestResult(testId) {
    return fetch(`/api/tests/instance/${testId}`, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            data.Questions.forEach((question) => {
                if (typeof question.Answer === "string") {
                    question.Answer = JSON.parse(question.Answer)
                }

                question.IsCorrect = isAnswerCorrect(question.Question, question.Answer)
            })

            data.CorrectCount = data.Questions.reduce((acc, value) => {
                return acc + (value.IsCorrect ? 1 : 0)
            }, 0)

            data.TotalCount = data.Questions.length

            return {...data, lastSuccessTime: Date.now()}
        })
}

