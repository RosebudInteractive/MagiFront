import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {all, takeEvery, put, take, call, select} from "@redux-saga/core/effects";
import type {ProcessTask, UpdatingCommentData, UpdatingTask, UpdatingTaskData} from "../types/task";
import {getProcess} from "tt-ducks/process";
import {SAVE_TASK_SUCCESS} from "tt-ducks/task";

/**
 * Constants
 * */
export const moduleName = 'modal-task-editor'
const prefix = `${appName}/${moduleName}`

const SHOW_TASK_EDITOR_REQUEST = `${prefix}/SHOW_TASK_EDITOR_REQUEST`
const SHOW_TASK_EDITOR_START = `${prefix}/SHOW_TASK_EDITOR_START`

const CLOSE_TASK_EDITOR_REQUEST = `${prefix}/CLOSE_TASK_EDITOR_REQUEST`
const CLOSE_TASK_EDITOR_START = `${prefix}/CLOSE_TASK_EDITOR_START`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    editorVisible: false,
    taskId: null,
    processId: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case SHOW_TASK_EDITOR_START:
            return state
                .set("editorVisible", true)
                .set("taskId", payload.taskId)
                .set("processId", payload.processId)

        case CLOSE_TASK_EDITOR_START:
            return state
                .set("editorVisible", true)


        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const editorVisibleSelector = createSelector(stateSelector, state => state.editorVisible)
export const taskIdSelector = createSelector(stateSelector, state => state.taskId)
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

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(SHOW_TASK_EDITOR_REQUEST, showTaskEditorSaga)
    ])
}

function* showTaskEditorSaga({payload}) {
    yield put({type: SHOW_TASK_EDITOR_START, payload: payload})

    yield take(SAVE_TASK_SUCCESS, _getProcess)
}

function* _getProcess(){
    const processId = yield select(processIdSelector)

    yield put(clo)
    if (processId) {
        yield put(getProcess(processId))
    }

}
