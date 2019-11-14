import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import {all, call, put, takeEvery, select, race, take} from "@redux-saga/core/effects";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {GET_TEST_COMPLETED, GET_TEST_FAIL, getTest, testSelector} from "ducks/test";
import {push} from 'react-router-redux'
import {ANSWER_TYPES, DATA_EXPIRATION_TIME} from "../constants/common-consts";
import React from "react";

/**
 * Constants
 * */
export const moduleName = 'test-instance'
const prefix = `${appName}/${moduleName}`


const CREATE_TEST_INSTANCE_REQUEST = `${prefix}/CREATE_TEST_INSTANCE_REQUEST`
const CREATE_TEST_INSTANCE_START = `${prefix}/CREATE_TEST_INSTANCE_START`
const CREATE_TEST_INSTANCE_SUCCESS = `${prefix}/CREATE_TEST_INSTANCE_SUCCESS`
const CREATE_TEST_INSTANCE_FAIL = `${prefix}/CREATE_TEST_INSTANCE_FAIL`

const GET_TEST_INSTANCE_REQUEST = `${prefix}/GET_TEST_INSTANCE_REQUEST`
const GET_TEST_INSTANCE_START = `${prefix}/GET_TEST_INSTANCE_START`
const GET_TEST_INSTANCE_COMPLETED = `${prefix}/GET_TEST_INSTANCE_COMPLETED`
const GET_TEST_INSTANCE_SUCCESS = `${prefix}/GET_TEST_INSTANCE_SUCCESS`
const GET_TEST_INSTANCE_FAIL = `${prefix}/GET_TEST_INSTANCE_FAIL`

const SET_ANSWER_REQUEST = `${prefix}/SET_ANSWER_REQUEST`
const SET_ANSWER_SUCCESS = `${prefix}/SET_ANSWER_SUCCESS`

const SAVE_INSTANCE_REQUEST = `${prefix}/SAVE_INSTANCE_REQUEST`
const SAVE_INSTANCE_START = `${prefix}/SAVE_INSTANCE_START`
const SAVE_INSTANCE_SUCCESS = `${prefix}/SAVE_INSTANCE_SUCCESS`
const SAVE_INSTANCE_FAIL = `${prefix}/SAVE_INSTANCE_FAIL`

const SET_ANSWER_AND_SAVE_REQUEST = `${prefix}/SET_ANSWER_AND_SAVE_REQUEST`
const FINISH_INSTANCE_REQUEST = `${prefix}/FINISH_INSTANCE_REQUEST`
const FINISH_INSTANCE_SUCCESS = `${prefix}/FINISH_INSTANCE_SUCCESS`

const InstanceRecord = Record({
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
})

const ReducerRecord = Record({
    loading: false,
    saving: false,
    loaded: false,
    testInstance: new InstanceRecord(),
    questions: new Map([]),
    lastSuccessTime: null,
})

const QuestionRecord = Record({
    AnswTime: null,
    Answer: null,
    Question: null,
    Score: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case CREATE_TEST_INSTANCE_START:
        case GET_TEST_INSTANCE_START:
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_TEST_INSTANCE_SUCCESS:
        case CREATE_TEST_INSTANCE_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('testInstance', new InstanceRecord(payload))
                .set('questions', dataToEntries(payload.Questions, QuestionRecord))
                .set('lastSuccessTime', payload.lastSuccessTime)

        case CREATE_TEST_INSTANCE_FAIL:
        case GET_TEST_INSTANCE_FAIL:
            return state
                .set('loading', false)

        case GET_TEST_INSTANCE_COMPLETED:
            return state
                .set('loading', false)

        case SET_ANSWER_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('testInstance', payload.instance)
                .set('questions', payload.questions)

        case FINISH_INSTANCE_SUCCESS:
            return state
                .set('testInstance', payload)

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
export const testInstanceSelector = createSelector(stateSelector, state => state.testInstance)
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
export const createNewTestInstance = (testUrl) => {
    return {type: CREATE_TEST_INSTANCE_REQUEST, payload: testUrl}
}

export const getTestInstance = (testId) => {
    return { type: GET_TEST_INSTANCE_REQUEST, payload: testId }
}

export const setAnswer = (answer) => {
    return { type: SET_ANSWER_REQUEST, payload: answer }
}

export const save = (answer) => {
    return { type: SAVE_INSTANCE_REQUEST, payload: answer }
}

export const setAnswerAndSave = (answer) => {
    return { type: SET_ANSWER_AND_SAVE_REQUEST, payload: answer }
}

export const setAnswerAndFinish = (answer) => {
    return { type: FINISH_INSTANCE_REQUEST, payload: answer }
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(CREATE_TEST_INSTANCE_REQUEST, createNewTestInstanceSaga),
        takeEvery(GET_TEST_INSTANCE_REQUEST, getTestInstanceSaga),
        takeEvery(SET_ANSWER_REQUEST, setAnswerSaga),
        takeEvery(SAVE_INSTANCE_REQUEST, saveInstanceSaga),
        takeEvery(SET_ANSWER_AND_SAVE_REQUEST, setAnswerAndSaveSaga),
        takeEvery(FINISH_INSTANCE_REQUEST, finishInstanceSaga),
    ])
}

function* createNewTestInstanceSaga(data) {
    yield put({ type: CREATE_TEST_INSTANCE_START })

    yield put(getTest(data.payload))

    const {success} = yield race({
        success: take(GET_TEST_COMPLETED),
        error: take(GET_TEST_FAIL)
    })

    if (!success) { return }

    try {
        const _test = yield select(testSelector)

        const _instance = yield call(_fetchCreateInstanceTest, _test.Id)

        yield put({type: CREATE_TEST_INSTANCE_SUCCESS, payload: _instance})
        yield put(push(`/test-instance/${_instance.Id}`))
    } catch (e) {
        yield put({ type: CREATE_TEST_INSTANCE_FAIL, payload: {e} })
    }
}


function _fetchCreateInstanceTest(testId) {
    return fetch("/api/tests/instance",
        {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({TestId: testId}),
            credentials: 'include'
        })
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            return {...data.test, lastSuccessTime: Date.now()}
        })
}

function* getTestInstanceSaga(data) {

    let _time = yield select(successTimeSelector),
        _instance = yield select(testInstanceSelector)

    if (!!_time && ((Date.now() - _time) < DATA_EXPIRATION_TIME) && !!_instance && _instance.Id === data.payload) {
        yield put({ type: GET_TEST_INSTANCE_COMPLETED })
        return
    }

    yield put({ type: GET_TEST_INSTANCE_START })

    try {
        const _instance = yield call(_fetchGetInstanceTest, data.payload)

        yield put(getTest(_instance.TestId))

        yield put({type: GET_TEST_INSTANCE_SUCCESS, payload: _instance})
    } catch (e) {
        yield put({ type: GET_TEST_INSTANCE_FAIL, payload: {e} })
    }
}

function _fetchGetInstanceTest(testId) {
    return fetch(`/api/tests/instance/${testId}`, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            return {...data, lastSuccessTime: Date.now()}
        })
}

function* setAnswerSaga(data) {
    const _answer = data.payload,
        _state = yield select(stateSelector)

    let _instance = yield select(testInstanceSelector),
        _questions = _state.questions,
        _question = _questions.get(_answer.questionId)

    if (_isAnswerCorrect(_question.Question, _answer)) {
        _questions = _questions.setIn([_answer.questionId, 'Score'], _question.Question.Score)
        _instance = _instance.set("Score", +_instance.Score + _question.Question.Score)
    }

    _questions = _questions.setIn([_answer.questionId, 'Answer'], JSON.stringify(_answer.value))

    yield put({type: SET_ANSWER_SUCCESS, payload: {instance: _instance, questions: _questions}})
}

const _isAnswerCorrect = (question, answer) => {
    switch (question.AnswType) {

        case ANSWER_TYPES.BOOL:
            return answer.value === question.AnswBool

        case ANSWER_TYPES.SELECT: {
            const _answerItem = question.Answers.find((item) => {
                return item.Id === answer.value[0]
            })

            return !!_answerItem && _answerItem.IsCorrect
        }

        case ANSWER_TYPES.MULTI_SELECT: {
            const _correctAnswers = question.Answers
                .filter((item) => {
                    return item.IsCorrect
                })
                .map(item => item.Id)

            const _firstStepCheck = answer.value.every(item => _correctAnswers.includes(item))

            const _secondStepCheck = _correctAnswers.every(item => answer.value.includes(item))

            return _firstStepCheck && _secondStepCheck
        }

        default:
            return false
    }
}

function* saveInstanceSaga() {
    let _instance = yield select(testInstanceSelector),
        _questions = yield select(questionsSelector)

    try{
        let _obj = _instance.toJS()
        _obj.Questions = _questions

        yield put({ type: SAVE_INSTANCE_START })

        const _result = yield call(_fetchSaveInstanceTest, _obj)

        console.log(_result)

        yield put({ type: SAVE_INSTANCE_SUCCESS })

    } catch (e) {
        yield put({ type: SAVE_INSTANCE_FAIL, payload: {e} })
    }
}

const _fetchSaveInstanceTest = (data) => {
    return fetch(`/api/tests/instance/${data.Id}`,
        {
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

function* setAnswerAndSaveSaga(data) {

    console.log('setAnswerAndSaveSaga')

    yield put(setAnswer(data.payload))

    console.log(SET_ANSWER_SUCCESS)

    yield take(SET_ANSWER_SUCCESS)

    console.log(SET_ANSWER_SUCCESS)

    yield put(save())
}

function* finishInstanceSaga(data) {

    yield put(setAnswer(data.payload))

    yield take(SET_ANSWER_SUCCESS)

    let _instance = yield select(testInstanceSelector)

    _instance = _instance.set("IsFinished", true)

    yield put({ type: FINISH_INSTANCE_SUCCESS, payload: _instance })

    yield put(save())

    const {success} = yield race({
        success: take(SAVE_INSTANCE_SUCCESS),
        error: take(SAVE_INSTANCE_FAIL)
    })

    if (!success) { return }

    yield put(push(`/test-result/${_instance.Id}`))
}