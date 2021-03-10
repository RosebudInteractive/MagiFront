import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";

import TASK from "../mock-data/task-3"
import {TASK_STATE} from "../constants/states";
import {paramsSelector} from "tt-ducks/route";
import {func} from "prop-types";
import {reset} from "redux-form";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";

/**
 * Constants
 * */
export const moduleName = 'task'
const prefix = `${appName}/${moduleName}`

const GET_TASK_REQUEST = `${prefix}/GET_TASK_REQUEST`
const GET_TASK_START = `${prefix}/GET_TASK_START`
const GET_TASK_SUCCESS = `${prefix}/GET_TASK_SUCCESS`
const GET_TASK_FAIL = `${prefix}/GET_TASK_FAIL`

const SAVE_TASK_REQUEST = `${prefix}/SAVE_TASK_REQUEST`
const SAVE_TASK_START = `${prefix}/SAVE_TASK_START`
const SAVE_TASK_SUCCESS = `${prefix}/SAVE_TASK_SUCCESS`
const SAVE_TASK_FAIL = `${prefix}/SAVE_TASK_FAIL`


/**
 * Reducer
 * */
export const ReducerRecord = Record({
    task: null,
    fetching: false,
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_TASK_START:
            return state
                .set("fetching", true)
                .set("task", null)

        case GET_TASK_SUCCESS:
            return state
                .set("fetching", false)
                .set("task", payload)

        case GET_TASK_FAIL:
            return state
                .set("fetching", false)

        default:
            return state
    }
}


/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const taskSelector = createSelector(stateSelector, state => state.task)


/**
 * Action Creators
 * */
export const getTask = (taskId) => {
    return {type: GET_TASK_REQUEST, payload: taskId}
}

export const saveTask = (task) => {
    return {type: GET_TASK_REQUEST, payload: task}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_TASK_REQUEST, getTaskSaga),
        takeEvery(SAVE_TASK_REQUEST, saveTaskSaga),
    ])
}


function* getTaskSaga(data) {
    yield put({type: GET_TASK_START})
    try {
        let _task = yield call(_fetchTask, data.payload)

        yield put({type: GET_TASK_SUCCESS, payload: _task})
    } catch (e) {
        yield put({type: GET_TASK_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _fetchTask = (taskId) => {
    return Promise.resolve(TASK)
    // return commonGetQuery(`/api/pm/task/${taskId}`)
}

function* saveTaskSaga(data) {
    yield put({type: SAVE_TASK_START})
    try {
        const id = yield call(_putTask, data.payload)

        yield put({type: SAVE_TASK_SUCCESS, payload: id})
        yield put(reset('TASK_EDITOR'))
        yield put(getTask(data.payload.Id))
    } catch (e) {
        yield put({type: SAVE_TASK_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _putTask = (data) => {
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
