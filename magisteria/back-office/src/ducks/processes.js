import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery} from "#common/tools/fetch-tools";
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {PROCESS_STATE} from "../constants/states";
import {paramsSelector} from "tt-ducks/route";
import {push} from "react-router-redux/src";
import {DELETE_PROCESS_SUCCESS} from "tt-ducks/process";

/**
 * Constants
 * */
export const moduleName = 'processes'
const prefix = `${appName}/${moduleName}`

const GET_PROCESSES_REQUEST = `${prefix}/GET_PROCESSES_REQUEST`
const GET_PROCESSES_START = `${prefix}/GET_PROCESSES_START`
export const GET_PROCESSES_SUCCESS = `${prefix}/GET_PROCESSES_SUCCESS`
export const GET_PROCESSES_FAIL = `${prefix}/GET_PROCESSES_FAIL`

const GO_TO_PROCESS_REQUEST = `${prefix}/GO_TO_PROCESS_REQUEST`

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

        case DELETE_PROCESS_SUCCESS:
            return state
                .update("processes", (processes) => {
                    const _index = processes.findIndex(item => item.Id === payload)

                    if (_index > -1) {
                        processes.splice(_index, 1)

                        return [...processes]
                    } else {
                        return processes
                    }
                })

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

export const goToProcess = (processId: number) => {
    return {type: GO_TO_PROCESS_REQUEST, payload: processId}
}


    /**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_PROCESSES_REQUEST, getProcessesSaga),
        takeEvery(GO_TO_PROCESS_REQUEST, goToProcessSaga),
    ])
}


function* getProcessesSaga() {
    yield put({type: GET_PROCESSES_START})
    try {
        const params = yield select(paramsSelector)
        let _process = yield call(_fetchProcesses, params)

        _process = _process.map((task) => {
            return {
                ...task,
                CourseName: task.Course.Name,
                UserName: task.Supervisor.DisplayName,
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

    return _state ? {css: _state.css, label: _state.label} : {css: "_error", label: "????????????"}
}

export const _fetchProcesses = (params) => {
    // return Promise.resolve(PROCESSES)
    return commonGetQuery("/api/pm/process-list" + (params ? `?${params}` : ""))
}

function* goToProcessSaga(data) {
    yield put(push(`/process/${data.payload}`))
}
