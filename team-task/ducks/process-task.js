import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {all, takeEvery, put, take, call, select, takeLatest} from "@redux-saga/core/effects";
import type {ProcessTask,} from "../types/task";
import {getProcess} from "tt-ducks/process";
import {SAVE_TASK_SUCCESS, DELETE_TASK_SUCCESS, SAVE_TASK_LINKS_SUCCESS} from "tt-ducks/task";
import {setActiveTaskId} from "tt-ducks/route";

/**
 * Constants
 * */
export const moduleName = 'process-task'
const prefix = `${appName}/${moduleName}`

const SHOW_TASK_EDITOR_REQUEST = `${prefix}/SHOW_TASK_EDITOR_REQUEST`
const SHOW_TASK_EDITOR_START = `${prefix}/SHOW_TASK_EDITOR_START`

const SHOW_TASK_LINK_EDITOR_REQUEST = `${prefix}/SHOW_TASK_LINK_EDITOR_REQUEST`
const SHOW_TASK_LINK_EDITOR_START = `${prefix}/SHOW_TASK_LINK_EDITOR_START`

const CLOSE_TASK_EDITOR_REQUEST = `${prefix}/CLOSE_TASK_EDITOR_REQUEST`
const CLOSE_TASK_EDITOR_START = `${prefix}/CLOSE_TASK_EDITOR_START`

const CLOSE_TASK_LINK_EDITOR_REQUEST = `${prefix}/CLOSE_TASK_LINK_EDITOR_REQUEST`
const CLOSE_TASK_LINK_EDITOR_START = `${prefix}/CLOSE_TASK_LINK_EDITOR_START`


/**
 * Reducer
 * */
export const ReducerRecord = Record({
    editorVisible: false,
    linkEditorVisible: false,
    taskId: null,
    parentTaskId: null,
    processId: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case SHOW_TASK_EDITOR_START:
            return state
                .set("editorVisible", true)
                .set("taskId", payload.taskId)
                .set("parentTaskId", payload.parentTaskId ? payload.parentTaskId : null)
                .set("processId", payload.processId)

        case SHOW_TASK_LINK_EDITOR_START:
            return state
                .set("linkEditorVisible", true)
                .set("taskId", payload.taskId)
                .set("processId", payload.processId)

        case CLOSE_TASK_EDITOR_START:
            return state
                .set("editorVisible", false)
                .set("taskId", null)
                .set("parentTaskId", null)
                .set("processId", null)

        case CLOSE_TASK_LINK_EDITOR_START:
            return state
                .set("linkEditorVisible", false)
                .set("taskId", null)
                .set("processId", null)

        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const editorVisibleSelector = createSelector(stateSelector, state => state.editorVisible)
export const linkEditorVisibleSelector = createSelector(stateSelector, state => state.linkEditorVisible)
export const taskIdSelector = createSelector(stateSelector, state => state.taskId)
export const parentTaskIdSelector = createSelector(stateSelector, state => state.parentTaskId)
export const processIdSelector = createSelector(stateSelector, state => state.processId)


/**
 * Action Creators
 * */
export const showTaskEditor = (processTask: ProcessTask) => {
    return {type: SHOW_TASK_EDITOR_REQUEST, payload: processTask}
}

export const closeTaskEditor = () => {
    return {type: CLOSE_TASK_EDITOR_REQUEST,}
}

export const showTaskLinkEditor = (processTask: ProcessTask) => {
    return {type: SHOW_TASK_LINK_EDITOR_REQUEST, payload: processTask}
}

export const closeTaskLinkEditor = () => {
    return {type: CLOSE_TASK_LINK_EDITOR_REQUEST,}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(SHOW_TASK_EDITOR_REQUEST, showTaskEditorSaga),
        takeEvery(CLOSE_TASK_EDITOR_REQUEST, closeTaskEditorSaga),
        takeEvery(DELETE_TASK_SUCCESS, closeTaskEditorSaga),
        takeEvery(SHOW_TASK_LINK_EDITOR_REQUEST, showTaskLinEditorSaga),
        takeEvery(CLOSE_TASK_LINK_EDITOR_REQUEST, closeTaskLinkEditorSaga),
    ])
}

function* showTaskEditorSaga({payload}) {
    yield put({type: SHOW_TASK_EDITOR_START, payload: payload})

    const {payload: data} = yield take(SAVE_TASK_SUCCESS)

    console.log(data)
    yield put(setActiveTaskId(data.id))

    yield call(_closeEditorAndReloadProcess)
}

function* showTaskLinEditorSaga({payload}) {
    yield put({type: SHOW_TASK_LINK_EDITOR_START, payload: payload})

    yield take(SAVE_TASK_LINKS_SUCCESS)

    yield call(_closeEditorAndReloadProcess)
}

function* _closeEditorAndReloadProcess(){
    const processId = yield select(processIdSelector)

    yield put(closeTaskEditor())
    yield put(closeTaskLinkEditor())
    if (processId) {
        yield put(getProcess(processId))
    }
}

function* closeTaskEditorSaga() {
    yield put({type: CLOSE_TASK_EDITOR_START})
}


function* closeTaskLinkEditorSaga() {
    yield put({type: CLOSE_TASK_LINK_EDITOR_START})
}
