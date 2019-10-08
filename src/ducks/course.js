import {appName} from '../config'
import {Map, Record,} from 'immutable'
import 'whatwg-fetch';
import {all, takeEvery, put, call, select} from 'redux-saga/effects'
import {checkStatus, getErrorMessage, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {DISABLE_BUTTONS, ENABLE_BUTTONS} from "adm-ducks/app";
import {SHOW_ERROR_DIALOG} from "../constants/Common";

/**
 * Constants
 * */
export const moduleName = 'course_ver_2'
const prefix = `${appName}/${moduleName}`

const SEND_EMAIL_REQUEST = `${prefix}/SEND_EMAIL_REQUEST`
// const SEND_EMAIL_START = `${prefix}/SEND_EMAIL_START`
// const SEND_EMAIL_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
// const SEND_EMAIL_FAIL = `${prefix}/SEND_EMAIL_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
})


/**
 * Action Creators
 * */

export const sendEmail = (courseId) => {
    return {type: SEND_EMAIL_REQUEST, payload: courseId}
}


/**
 * Sagas
 */
function* sendEmailSaga(data) {
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
    return fetch(`/mailing/${id}`,
        {
            method: "GET",
            credentials: 'include'
        })
        .then(checkStatus)
}


export const saga = function* () {
    yield all([
        takeEvery(SEND_EMAIL_REQUEST, sendEmailSaga)
    ])
}
