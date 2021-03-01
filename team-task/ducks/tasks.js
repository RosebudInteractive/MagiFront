import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";

import TASKS from "../mock-data/tasks"
import {TASK_STATE} from "../constants/states";
import {paramsSelector} from "tt-ducks/route";
/**
 * Constants
 * */
export const moduleName = 'tasks'
const prefix = `${appName}/${moduleName}`

const GET_TASKS_REQUEST = `${prefix}/GET_TASKS_REQUEST`
const GET_TASKS_START = `${prefix}/GET_TASKS_START`
export const GET_TASKS_SUCCESS = `${prefix}/GET_TASKS_SUCCESS`
export const GET_TASKS_FAIL = `${prefix}/GET_TASKS_FAIL`


/**
 * Reducer
 * */
export const ReducerRecord = Record({
    tasks: [],
    fetching: false,
    order: "",
    filter: "",
    states: Object.values(TASK_STATE).map((item) => { return {value: item.value, label: item.label} }),
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_TASKS_START:
            return state
                .set("fetching", true)
                .set("tasks", [])

        case GET_TASKS_SUCCESS:
            return state
                .set("fetching", false)
                .set("tasks", payload)

        case GET_TASKS_FAIL:
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
export const tasksSelector = createSelector(stateSelector, state => state.tasks)
export const statesSelector = createSelector(stateSelector, state => state.states)


/**
 * Action Creators
 * */
export const getTasks = () => {
    return {type: GET_TASKS_REQUEST}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_TASKS_REQUEST, getTasksSaga),
    ])
}


function* getTasksSaga() {
    yield put({type: GET_TASKS_START})
    try {
        const params = yield select(paramsSelector)

        let _tasks = yield call(_fetchTasks, params)

        _tasks = _tasks.map((task) => {
            return {
                ...task,
                ProcessName: task.Process.Name,
                ElementName: task.Element.Name,
                Executor: {
                    Id: task.Executor.Id ? task.Executor.Id : -1
                },
                ExecutorName: task.Executor.DisplayName,
                ..._getTaskStateData(task.State)
            }
        })

        yield put({type: GET_TASKS_SUCCESS, payload: _tasks})
    } catch (e) {
        yield put({type: GET_TASKS_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _getTaskStateData = (state) => {
    const _state = Object.values(TASK_STATE).find(item => item.value === state)

    return _state ? {css: _state.css, label: _state.label} : {css: "_unknown", label: "Неизвестно"}
}

const _fetchTasks = (params) => {
    return Promise.resolve(TASKS)
    // return commonGetQuery("/api/pm/task-list" + (params ? `&${params}` : ""))
}
