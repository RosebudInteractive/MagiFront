import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";

import TASK from "../mock-data/task-3"
import {hasSupervisorRights, userSelector} from "tt-ducks/auth";
import {reset} from "redux-form";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import type {UpdatingCommentData, UpdatingTask, UpdatingTaskData} from "../types/task";
import {COMMENT_ACTION} from "../constants/common";

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

const SET_USERS = `${prefix}/SET_USERS`
const SET_ELEMENTS = `${prefix}/SET_ELEMENTS`

const GET_PROCESS_ELEMENT_REQUEST = `${prefix}/GET_PROCESS_ELEMENT_REQUEST`
const GET_PROCESS_ELEMENT_START = `${prefix}/GET_PROCESS_ELEMENT_START`
const GET_PROCESS_ELEMENT_SUCCESS = `${prefix}/GET_PROCESS_ELEMENT_SUCCESS`
const GET_PROCESS_ELEMENT_FAIL = `${prefix}/GET_PROCESS_ELEMENT_FAIL`
const CLEAR_PROCESS_ELEMENT = `${prefix}/CLEAR_PROCESS_ELEMENT`

const Element = Record({
    Id: null,
    Name: null,
    State: 0,
    Supervisor: new Record({
        Id: null,
        DisplayName: ""
    }),
    WriteSets: {},
    Fields: []
})
/**
 * Reducer
 * */
export const ReducerRecord = Record({
    task: null,
    users: [],
    elements: [],
    fetching: false,
    currentElement: new Element()
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_TASK_START:
            return state
                .set("fetching", true)
                .set("task", null)
                .set("currentElement", new Element())

        case GET_TASK_SUCCESS:
            return state
                .set("fetching", false)
                .set("task", payload)

        case GET_TASK_FAIL:
        case SAVE_TASK_FAIL:
        case GET_PROCESS_ELEMENT_FAIL:
            return state
                .set("fetching", false)

        case GET_PROCESS_ELEMENT_SUCCESS:
            return state
                .set("currentElement", new Element(payload))
                .set("fetching", false)

        case SAVE_TASK_START:
            return state
                .set("fetching", true)

        case GET_PROCESS_ELEMENT_START:
            return state
                .set("fetching", true)
                .set("currentElement", new Element())

        case SET_USERS:
            return state
                .set("users", payload)

        case SET_ELEMENTS:
            return state
                .set("elements", payload)

        case CLEAR_PROCESS_ELEMENT:
            return state
                .set("currentElement", new Element())

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
export const usersSelector = createSelector(stateSelector, state => state.users)
export const elementsSelector = createSelector(stateSelector, state => state.elements)
export const currentElementSelector = createSelector(stateSelector, state => state.currentElement)


/**
 * Action Creators
 * */
export const getTask = (taskId: number) => {
    return {type: GET_TASK_REQUEST, payload: taskId}
}

export const saveTask = (data: UpdatingTaskData) => {
    return {type: SAVE_TASK_REQUEST, payload: data}
}

export const getProcessElement = (elementId: number) => {
    return {type: GET_PROCESS_ELEMENT_REQUEST, payload: elementId}

}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_TASK_REQUEST, getTaskSaga),
        takeEvery(SAVE_TASK_REQUEST, saveTaskSaga),
        takeEvery(GET_PROCESS_ELEMENT_REQUEST, getProcessElementSaga),
    ])
}


function* getTaskSaga(data) {
    yield put({type: GET_TASK_START})
    try {
        let _task = yield call(_fetchTask, data.payload)

        const _user = yield select(userSelector),
            _hasSupervisorRights = yield select(hasSupervisorRights)

        let _users = []
        if (_hasSupervisorRights) {
            _users = yield call(_getUsers)
        } else {
            if (_task.Executor) {
                _users.push({Id: _task.Executor.Id, DisplayName: _task.Executor.DisplayName})
            }
        }

        yield put({type: SET_USERS, payload: _users})

        if (_task.Process && _task.Process.Id) {
            const _elements = yield call(_getProcessElements, _task.Process.Id)
            yield put({type: SET_ELEMENTS, payload: _elements})
        }

        const _lastComment = _task.Log && _task.Log.length && _task.Log[_task.Log.length - 1],
            _isUserComment = _lastComment && _lastComment.User.Id === _user.Id

        _task.UserLastComment = _isUserComment ? { Id: _lastComment.Id, Text: _lastComment.Text } : null

        yield put({type: GET_TASK_SUCCESS, payload: _task})
    } catch (e) {
        yield put({type: GET_TASK_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _fetchTask = (taskId) => {
    return commonGetQuery(`/api/pm/task/${taskId}`)
}

const _getUsers = () => {
    return commonGetQuery("/api/users/list?role=a,pma,pms,pme,pmu")
}

const _getProcessElements = (processId) => {
    return commonGetQuery(`/api/pm/process/${processId}/elements`)
}

function* saveTaskSaga({payload}) {
    yield put({type: SAVE_TASK_START})
    try {
        const data: UpdatingTaskData = payload,
            result = yield call(_putTask, data.task),
            id = data.task.Id,
            elementId = data.task.ElementId

        yield put({type: SAVE_TASK_SUCCESS, payload: result})

        console.log(data)

        if (data.comment) {
            if (data.comment.action === COMMENT_ACTION.UPDATE) {
                yield call(_updateComment, data.comment)
            } else if (data.comment.action === COMMENT_ACTION.DELETE) {
                yield call(_deleteComment, data.comment.id)
            }
        }

        yield put(reset('TASK_EDITOR'))
        yield all([
            put(getTask(id)),
            put(getProcessElement(elementId)),
            ])
    } catch (e) {
        yield put({type: SAVE_TASK_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _putTask = (data: UpdatingTask) => {
    return fetch(`/api/pm/task/${data.Id}`, {
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

const _updateComment = (comment: UpdatingCommentData) => {
    return fetch(`/api/pm/task-log/${comment.id}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({Text: comment.text}),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

const _deleteComment = (commentId: number) => {
    return fetch(`/api/pm/task-log/${commentId}`, {
        method: 'DELETE',
        headers: { "Content-type": "application/json" },
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* getProcessElementSaga(data) {
    if (!data.payload) {
        yield put({type: CLEAR_PROCESS_ELEMENT})
    } else {
        yield put({type: GET_PROCESS_ELEMENT_START})
        try {
            const element = yield call(_getProcessElementData, data.payload)

            yield put({type: GET_PROCESS_ELEMENT_SUCCESS, payload: element})
        } catch (e) {
            yield put({type: GET_PROCESS_ELEMENT_FAIL})
            yield put(showErrorMessage(e.message))
        }
    }
}

const _getProcessElementData = (elementId) => {
    return commonGetQuery(`/api/pm/process-elem/${elementId}`)
}
