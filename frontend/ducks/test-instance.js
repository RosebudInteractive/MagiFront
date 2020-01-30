import {appName} from '../config'
import {createSelector} from 'reselect'
import {Map, Record,} from 'immutable'
import {all, call, put, takeEvery, select, race, take} from "@redux-saga/core/effects";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {GET_TEST_COMPLETED, GET_TEST_FAIL, getTest, loadTestData, testSelector} from "ducks/test";
import {push} from 'react-router-redux'
import {DATA_EXPIRATION_TIME} from "../constants/common-consts";
import {isAnswerCorrect} from "tools/tests-tools";
import {LOGOUT_SUCCESS, SHOW_SIGN_IN_FORM, USER_HAS_BEEN_LOADED} from "../constants/user";
import {CLEAR_WAITING_AUTHORIZE} from "ducks/app";
import {FINISH_LOAD_PROFILE} from "ducks/profile";
import {START_BILLING_BY_REDIRECT} from "ducks/billing";

/**
 * Constants
 * */
export const moduleName = 'test-instance'
const prefix = `${appName}/${moduleName}`


const CLEAR_INSTANCE = `${prefix}/CLEAR_INSTANCE`

const CREATE_TEST_INSTANCE_REQUEST = `${prefix}/CREATE_TEST_INSTANCE_REQUEST`
const CREATE_TEST_INSTANCE_START = `${prefix}/CREATE_TEST_INSTANCE_START`
const CREATE_TEST_INSTANCE_SUCCESS = `${prefix}/CREATE_TEST_INSTANCE_SUCCESS`
const CREATE_TEST_INSTANCE_FAIL = `${prefix}/CREATE_TEST_INSTANCE_FAIL`

const GET_TEST_INSTANCE_REQUEST = `${prefix}/GET_TEST_INSTANCE_REQUEST`
const GET_TEST_INSTANCE_START = `${prefix}/GET_TEST_INSTANCE_START`
const GET_TEST_INSTANCE_COMPLETED = `${prefix}/GET_TEST_INSTANCE_COMPLETED`
const GET_TEST_INSTANCE_SUCCESS = `${prefix}/GET_TEST_INSTANCE_SUCCESS`
const GET_TEST_INSTANCE_FAIL = `${prefix}/GET_TEST_INSTANCE_FAIL`
const INSTANCE_NOT_FOUND = `${prefix}/INSTANCE_NOT_FOUND`

const SET_ANSWER_REQUEST = `${prefix}/SET_ANSWER_REQUEST`
const SET_ANSWER_SUCCESS = `${prefix}/SET_ANSWER_SUCCESS`

const SAVE_INSTANCE_REQUEST = `${prefix}/SAVE_INSTANCE_REQUEST`
const SAVE_INSTANCE_START = `${prefix}/SAVE_INSTANCE_START`
const SAVE_INSTANCE_SUCCESS = `${prefix}/SAVE_INSTANCE_SUCCESS`
const SAVE_INSTANCE_FAIL = `${prefix}/SAVE_INSTANCE_FAIL`

const SET_ANSWER_AND_SAVE_REQUEST = `${prefix}/SET_ANSWER_AND_SAVE_REQUEST`
const FINISH_INSTANCE_REQUEST = `${prefix}/FINISH_INSTANCE_REQUEST`
const FINISH_INSTANCE_SUCCESS = `${prefix}/FINISH_INSTANCE_SUCCESS`

const SET_SHARE_URL = `${prefix}/SET_SHARE_URL`
const CLEAR_SHARE_URL = `${prefix}/CLEAR_SHARE_URL`
const SET_WAITING_AUTHORIZE = `${prefix}/SET_WAITING_AUTHORIZE`
const UNLOCK_TEST_REQUEST = `${prefix}/UNLOCK_TEST_REQUEST`

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
    CorrectCount: 0,
    TotalCount: 0,
    IsLocal: false,
})

const Waiting = Record({data: null, active: false})

const ReducerRecord = Record({
    loading: false,
    saving: false,
    loaded: false,
    testInstance: new InstanceRecord(),
    questions: new Map([]),
    lastSuccessTime: null,
    blocked: false,
    notFound: false,
    shareUrl: null,
    urlCreated: null,
    waiting: new Waiting(),
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
        case GET_TEST_INSTANCE_START:
            return state
                .set('loaded', false)
                .set('loading', true)
                .set('blocked', false)

        case CREATE_TEST_INSTANCE_START:
            return state
                .set('loaded', false)
                .set('loading', true)
                .set('blocked', true)

        case GET_TEST_INSTANCE_SUCCESS:
        case CREATE_TEST_INSTANCE_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('testInstance', new InstanceRecord(payload))
                .set('questions', dataToEntries(payload.Questions, QuestionRecord))
                .set('lastSuccessTime', payload.lastSuccessTime)
                .set('blocked', false)

        case CREATE_TEST_INSTANCE_FAIL:
        case GET_TEST_INSTANCE_FAIL:
            return state
                .set('loading', false)
                .set('blocked', false)

        case GET_TEST_INSTANCE_COMPLETED:
            return state
                .set('loading', false)
                .set('loaded', true)

        case SET_ANSWER_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('testInstance', payload.instance)
                .set('questions', payload.questions)

        case FINISH_INSTANCE_SUCCESS:
            return state
                .set('testInstance', payload.instance)

        case INSTANCE_NOT_FOUND:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('notFound', true)
                .set('blocked', false)

        case CLEAR_INSTANCE:
        case LOGOUT_SUCCESS:
            return state = new ReducerRecord()

        case SET_SHARE_URL:
            return state
                .set('shareUrl', payload)
                .set('urlCreated', true)

        case CLEAR_SHARE_URL:
            return state
                .set('shareUrl', null)
                .set('urlCreated', false)

        case SET_WAITING_AUTHORIZE:
            return state
                .setIn(['waiting', 'data'], payload)
                .setIn(['waiting', 'active'], true)

        case CLEAR_WAITING_AUTHORIZE:
            return state
                .setIn(['waiting', 'data'], null)
                .setIn(['waiting', 'active'], false)

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
export const blockedSelector = createSelector(stateSelector, state => state.blocked)
const successTimeSelector = createSelector(stateSelector, state => state.lastSuccessTime)
export const testInstanceSelector = createSelector(stateSelector, state => state.testInstance)
export const notFoundSelector = createSelector(stateSelector, state => state.notFound)
export const shareUrlSelector = createSelector(stateSelector, state => state.shareUrl)
export const urlCreatedSelector = createSelector(stateSelector, state => state.urlCreated)
export const questionsSelector = createSelector(stateSelector, (state) => {
    let _array = state.questions.toArray();

    return _array.map((item, index) => {
        let _item = item.toJS()

        _item.Number = index + 1
        return _item
    })
})
const waitingAuth = createSelector(stateSelector, state => state.waiting)
export const isWaitingAuthorize = createSelector(waitingAuth, waiting => waiting.active)
export const waitingDataSelector = createSelector(waitingAuth, (waiting) => {
    return waiting.active ? waiting.data : null
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

export const clearInstance = () => {
    return {type: CLEAR_INSTANCE}
}

export const setShareUrl = (url) => {
    return {type: SET_SHARE_URL, payload: url}
}

export const clearShareUrl = () => {
    return {type: CLEAR_SHARE_URL}
}

export const setWaitingAuthorizeData = (data) => {
    return {type: SET_WAITING_AUTHORIZE, payload: data}
}

export const unlockTest = (data) => {
    return {type: UNLOCK_TEST_REQUEST, payload: data}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(CREATE_TEST_INSTANCE_REQUEST, createNewTestInstanceSaga),
        takeEvery(UNLOCK_TEST_REQUEST, unlockAndCreateNewTestInstanceSaga),
        takeEvery(GET_TEST_INSTANCE_REQUEST, getTestInstanceSaga),
        takeEvery(SET_ANSWER_REQUEST, setAnswerSaga),
        takeEvery(SAVE_INSTANCE_REQUEST, saveInstanceSaga),
        takeEvery(SET_ANSWER_AND_SAVE_REQUEST, setAnswerAndSaveSaga),
        takeEvery(FINISH_INSTANCE_REQUEST, finishInstanceSaga),
        takeEvery(FINISH_LOAD_PROFILE, onFinishLoadProfileSaga),
    ])
}



function* createNewTestInstanceSaga(data) {
    yield _createInstance(data.payload)
}

function* unlockAndCreateNewTestInstanceSaga(data) {
    const _state = yield select(state => state),
        _authorized = !!_state.user.user;

    console.log(data)

    if (!_authorized) {
        yield _setWaitingAuthorize(data.payload)
    } else {
        yield _createInstance(data.payload)
    }
}

function* _setWaitingAuthorize(data) {
    yield put(setWaitingAuthorizeData(data))
    yield put({type: SHOW_SIGN_IN_FORM})
}

function* _createInstance(data) {
    const _waiting = yield select(waitingAuth),
        _data = _waiting.active ? _waiting.data : data

    console.log(_data)

    yield put({ type: CREATE_TEST_INSTANCE_START })
    yield put(clearShareUrl())

    yield put(getTest(_data))

    const {success} = yield race({
        success: take(GET_TEST_COMPLETED),
        error: take(GET_TEST_FAIL)
    })

    if (!success) { return }

    try {
        const _test = yield select(testSelector)

        const _instance = yield call(_fetchCreateInstanceTest, _test.Id)

        yield put({type: CREATE_TEST_INSTANCE_SUCCESS, payload: _instance})
        if (!_instance.IsLocal) {
            yield put(push(`/test-instance/${_instance.Id}`))
        }
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
        _instance = yield select(testInstanceSelector),
        _user = yield select(state => state.user)

    if (!_user.user && _user.loading) {
        yield take(USER_HAS_BEEN_LOADED)
    }

    _user = yield select(state => state.user)

    if (!!_time && ((Date.now() - _time) < DATA_EXPIRATION_TIME) && !!_instance && _instance.Id === +data.payload) {
        yield loadTestData(_instance.TestId)
        yield put({ type: GET_TEST_INSTANCE_COMPLETED })
        return
    }

    if (!!_instance.Id && _instance.Id !== +data.payload) {
        yield put(clearShareUrl())
    }

    yield put({ type: GET_TEST_INSTANCE_START })

    try {
        const _instance = yield call(_fetchGetInstanceTest, data.payload)

        if (!!_user.user && (_instance.UserId === _user.user.Id)) {
            yield put(getTest(_instance.TestId))
            yield put({type: GET_TEST_INSTANCE_SUCCESS, payload: _instance})
        } else {
            yield loadTestData(_instance.TestId)
            yield put(clearInstance())
            const _test = yield select(testSelector)

            yield put(push(`/test/${_test.URL}`))
        }

    } catch (e) {

        console.log(e)

        if (e.status && (e.status === 404)) {
            yield put({ type: INSTANCE_NOT_FOUND })
        } else {
            yield put({type: GET_TEST_INSTANCE_FAIL, payload: {e}})
        }
    }
}

function _fetchGetInstanceTest(testId) {
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

function* setAnswerSaga(data) {
    const _answer = data.payload,
        _state = yield select(stateSelector)

    let _instance = yield select(testInstanceSelector),
        _questions = _state.questions,
        _question = _questions.get(_answer.questionId)

    if (isAnswerCorrect(_question.Question, _answer.value)) {
        _questions = _questions
            .setIn([_answer.questionId, 'Score'], _question.Question.Score)
            .setIn([_answer.questionId, 'IsCorrect'], true)
        _instance = _instance.set("Score", +_instance.Score + _question.Question.Score)
    }

    _questions = _questions.setIn([_answer.questionId, 'Answer'], _answer.value)

    yield put({type: SET_ANSWER_SUCCESS, payload: {instance: _instance, questions: _questions}})
}

function* saveInstanceSaga() {
    let _instance = yield select(testInstanceSelector),
        _questions = yield select(questionsSelector)

    try{
        let _obj = _instance.toJS()
        _obj.Questions = _questions.map(question => Object.assign({}, question))

        _obj.Questions.forEach((question) => {
            question.Answer = (question.Answer !== null) ? JSON.stringify(question.Answer) : null
        })

        yield put({ type: SAVE_INSTANCE_START })

        yield call(_fetchSaveInstanceTest, _obj)

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

    yield put(setAnswer(data.payload))

    yield take(SET_ANSWER_SUCCESS)

    yield put(save())
}

function* finishInstanceSaga(data) {

    yield put(setAnswer(data.payload))

    yield take(SET_ANSWER_SUCCESS)

    let _instance = yield select(testInstanceSelector),
        _questions = yield select(questionsSelector)

    let _correctCount = _questions.reduce((acc, value) => {
        return acc + (value.IsCorrect ? 1 : 0)
    }, 0)

    _instance = _instance.set("IsFinished", true)
        .set("TotalCount", _questions.length)
        .set("CorrectCount", _correctCount)

    yield put({ type: FINISH_INSTANCE_SUCCESS, payload: {instance: _instance}})

    yield put(save())
}

export const getShareLink = (instanceId) => {
    return fetch("/api/tests/instance/share",
        {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({InstanceId: instanceId}),
            credentials: 'include'
        })
        .then(checkStatus)
        .then(parseJSON)
}

function* onFinishLoadProfileSaga(data) {
    const _waiting = yield select(waitingAuth)

    if (_waiting.active) {
        yield _createInstance(data)
    }
}