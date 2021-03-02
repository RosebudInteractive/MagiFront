import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON, commonGetQuery} from "common-tools/fetch-tools";
import {reset} from "redux-form";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";

import PROCESSES from "../mock-data/processes"
import {PROCESS_STATE} from "../constants/states";
import {paramsSelector} from "tt-ducks/route";

/**
 * Constants
 * */
export const moduleName = 'processes'
const prefix = `${appName}/${moduleName}`

const GET_PROCESSES_REQUEST = `${prefix}/GET_PROCESSES_REQUEST`
const GET_PROCESSES_START = `${prefix}/GET_PROCESSES_START`
export const GET_PROCESSES_SUCCESS = `${prefix}/GET_PROCESSES_SUCCESS`
export const GET_PROCESSES_FAIL = `${prefix}/GET_PROCESSES_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    processes: [],
    states: Object.values(PROCESS_STATE).map((item) => { return {value: item.value, label: item.label} }),
    fetching: false,
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_PROCESSES_START:
            return state
                .set("fetching", true)
                .set("processes", [])

        case GET_PROCESSES_SUCCESS:
            return state
                .set("fetching", false)
                .set("processes", payload)

        case GET_PROCESSES_FAIL:
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
export const processesSelector = createSelector(stateSelector, state => state.processes)
export const statesSelector = createSelector(stateSelector, state => state.states)


/**
 * Action Creators
 * */
export const getProcesses = () => {
    return {type: GET_PROCESSES_REQUEST}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_PROCESSES_REQUEST, getTasksSaga)
    ])
}


function* getTasksSaga() {
    yield put({type: GET_PROCESSES_START})
    try {
        const params = yield select(paramsSelector)
        let _process = yield call(_fetchProcesses, params)

        _process = _process.map((task) => {
            return {
                ...task,
                CourseName: task.Course.Name,
                SupervisorName: task.Supervisor.DisplayName,
                LessonName: task.Lesson.Name,
                ..._getStateData(task.State)
            }
        })
        yield put({type: GET_PROCESSES_SUCCESS, payload: _process})
    } catch (e) {
        yield put({type: GET_PROCESSES_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _getStateData = (state) => {
    const _state = Object.values(PROCESS_STATE).find(item => item.value === state)

    return _state ? {css: _state.css, label: _state.label} : {css: "_unknown", label: "Неизвестно"}
}

const _fetchProcesses = (params) => {
    // return Promise.resolve(PROCESSES)
    return commonGetQuery("/api/pm/process-list" + (params ? `&${params}` : ""))
}
