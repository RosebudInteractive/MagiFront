import {appName} from '../config'
import {Map, OrderedMap, Record,} from 'immutable'
import 'whatwg-fetch';
import {all, takeEvery, put, call, select} from 'redux-saga/effects'
import {checkStatus, getErrorMessage, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {DISABLE_BUTTONS, ENABLE_BUTTONS,} from "adm-ducks/app";
import {SHOW_ERROR_DIALOG} from "../constants/Common";
import {queryUserConfirmationSaga} from "adm-ducks/messages";
import {createSelector} from "reselect";

/**
 * Constants
 * */
export const moduleName = 'course_ver_2'
const prefix = `${appName}/${moduleName}`

const GET_COURSES_REQUEST = `${prefix}/GET_COURSES_REQUEST`
const GET_COURSES_START = `${prefix}/GET_COURSES_START`
export const GET_COURSES_SUCCESS = `${prefix}/GET_COURSES_SUCCESS`
export const GET_COURSES_FAIL = `${prefix}/GET_COURSES_FAIL`

const SEND_EMAIL_REQUEST = `${prefix}/SEND_EMAIL_REQUEST`
const SEND_EMAIL_START = `${prefix}/SEND_EMAIL_START`
const SEND_EMAIL_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
const SEND_EMAIL_FAIL = `${prefix}/SEND_EMAIL_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    loading: false,
    loaded: false,
    entries: new OrderedMap([])
})

const CourseRecord = Record({
    Id: null,
    Name: null,
    Description: null,
    URL: null,
    OneLesson: null,

})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_COURSES_START: {
            return state
                .set('loaded', false)
                .set('loading', true)
        }

        case GET_COURSES_SUCCESS: {
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, CourseRecord))
        }

        case GET_COURSES_FAIL: {
            return state
                .set('loaded', false)
                .set('loading', false)
        }

        case SEND_EMAIL_START:
            return state
                .set('fetching', true)

        case SEND_EMAIL_SUCCESS:
        case SEND_EMAIL_FAIL:
            return state
                .set('fetching', true)

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

export const stateSelector = state => state[moduleName]

export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)

const entriesSelector = createSelector(stateSelector, state => state.entries)
export const coursesSelector = createSelector(entriesSelector, (entries) => {
    let _array = entries.toArray();

    return _array.map((item) => {
        let _item = item.toObject()

        _item.id = _item.Id
        return _item
    })
})

/**
 * Action Creators
 * */
export const getCourses = () => {
    return {type: GET_COURSES_REQUEST}
}

export const sendEmail = (courseId) => {
    return {type: SEND_EMAIL_REQUEST, payload: courseId}
}


/**
 * Sagas
 */
function* getCoursesSaga() {
    yield put({type: GET_COURSES_START})

    try {
        const _courses = yield call(_fetchCourses)

        yield put( {type: GET_COURSES_SUCCESS, payload: _courses} )
    } catch (e) {
        yield put({ type: GET_COURSES_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _fetchCourses = () => {
    return fetch("/api/adm/courses", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* sendEmailSaga(data) {

    const _confirmed = yield queryUserConfirmationSaga(`Запустить рассылку?`)

    if (!_confirmed) { return }

    yield put({type : DISABLE_BUTTONS})

    try {
        yield call(_fetchMailing, data.payload)
        yield put({type: SHOW_ERROR_DIALOG, payload: "Рассылка по курсу успешно запущена."})
    } catch (error) {
        const _message = yield call(getErrorMessage, error)
        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    } finally {
        yield put({type : ENABLE_BUTTONS})
    }
}

const _fetchMailing = (id) => {
    return fetch(`/api/adm/courses/mailing/${id}`,
        {
            method: "GET",
            credentials: 'include'
        })
        .then(checkStatus)
}


export const saga = function* () {
    yield all([
        takeEvery(GET_COURSES_REQUEST, getCoursesSaga),
        takeEvery(SEND_EMAIL_REQUEST, sendEmailSaga)
    ])
}
