import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON, commonGetQuery} from "#common/tools/fetch-tools";
import {all, call, put, select, take, takeEvery} from "@redux-saga/core/effects";
import {
    MODAL_MESSAGE_ACCEPT,
    MODAL_MESSAGE_DECLINE,
    showError,
    showErrorMessage,
    showUserConfirmation
} from "tt-ducks/messages";
import {hasElementEditorRights, userSelector} from "tt-ducks/auth";
import {reset} from "redux-form";
import type {ProcessTask, UpdatingCommentData, UpdatingTask,} from "../types/task";
import {COMMENT_ACTION} from "../constants/common";
import {getProcess} from "tt-ducks/process";
import {race} from "redux-saga/effects";
import type {Message} from "../types/messages";
import taskController from "../tools/task-controller";
import moment from "moment";
import {TASK_STATE} from "../constants/states";

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
export const SAVE_TASK_SUCCESS = `${prefix}/SAVE_TASK_SUCCESS`
const SAVE_TASK_FAIL = `${prefix}/SAVE_TASK_FAIL`

const CREATE_TASK_REQUEST = `${prefix}/CREATE_TASK_REQUEST`
const CREATE_TASK_START = `${prefix}/CREATE_TASK_START`
const CREATE_TASK_SUCCESS = `${prefix}/CREATE_TASK_SUCCESS`
const CREATE_TASK_FAIL = `${prefix}/CREATE_TASK_FAIL`

const DELETE_TASK_REQUEST = `${prefix}/DELETE_TASK_REQUEST`
const DELETE_TASK_START = `${prefix}/DELETE_TASK_START`
export const DELETE_TASK_SUCCESS = `${prefix}/DELETE_TASK_SUCCESS`
const DELETE_TASK_FAIL = `${prefix}/DELETE_TASK_FAIL`

const SET_USERS = `${prefix}/SET_USERS`
const SET_ELEMENTS = `${prefix}/SET_ELEMENTS`

const GET_PROCESS_ELEMENT_REQUEST = `${prefix}/GET_PROCESS_ELEMENT_REQUEST`
const GET_PROCESS_ELEMENT_START = `${prefix}/GET_PROCESS_ELEMENT_START`
const GET_PROCESS_ELEMENT_SUCCESS = `${prefix}/GET_PROCESS_ELEMENT_SUCCESS`
const GET_PROCESS_ELEMENT_FAIL = `${prefix}/GET_PROCESS_ELEMENT_FAIL`
const CLEAR_PROCESS_ELEMENT = `${prefix}/CLEAR_PROCESS_ELEMENT`

const SAVE_TASK_LINKS_REQUEST = `${prefix}/SAVE_TASK_LINKS_REQUEST`
const SAVE_TASK_LINKS_START = `${prefix}/SAVE_TASK_LINKS_START`
export const SAVE_TASK_LINKS_SUCCESS = `${prefix}/SAVE_TASK_LINKS_SUCCESS`
export const SAVE_TASK_LINKS_FAIL = `${prefix}/SAVE_TASK_LINKS_FAIL`

const SET_ACCESS_DENIED = `${prefix}/SET_ACCESS_DENIED`

const SAVE_COMMENT_REQUEST = `${prefix}/SAVE_COMMENT_REQUEST`
const SAVE_COMMENT_START = `${prefix}/SAVE_COMMENT_START`
const SET_COMMENT = `${prefix}/SET_COMMENT`
const DELETE_COMMENT = `${prefix}/DELETE_COMMENT`
const SAVE_COMMENT_FAIL = `${prefix}/SAVE_COMMENT_FAIL`

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
    accessDenied: false,
    users: [],
    elements: [],
    fetching: false,
    currentElement: new Element()
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_TASK_START:
        case CREATE_TASK_START:
            return state
                .set("fetching", true)
                .set("task", null)
                .set("accessDenied", false)
                .set("currentElement", new Element())

        case GET_TASK_SUCCESS:
            return state
                .set("fetching", false)
                .set("task", payload)

        case SAVE_TASK_SUCCESS:
            return state
                .set("fetching", false)

        case CREATE_TASK_SUCCESS:
            return state
                .set("fetching", false)
                .set("task", payload)
                .set("currentElement", new Element())

        case GET_TASK_FAIL:
        case CREATE_TASK_FAIL:
        case SAVE_TASK_FAIL:
        case GET_PROCESS_ELEMENT_FAIL:
        case SAVE_TASK_LINKS_FAIL:
            return state
                .set("fetching", false)

        case GET_PROCESS_ELEMENT_SUCCESS:
            return state
                .set("currentElement", new Element(payload))
                .set("fetching", false)

        case SAVE_TASK_START:
        case SAVE_TASK_LINKS_START:
            return state
                .set("fetching", true)

        case SAVE_TASK_LINKS_SUCCESS:
            return state
                .set("fetching", false)

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

        case SET_ACCESS_DENIED:
            return state
                .set("accessDenied", true)

        case SET_COMMENT:
            return state
                .update("task", (task) => {
                    const _comment = task.Log.find(item => item.Id === payload.id)

                    if (_comment) {
                        const _newValue = {...task}
                        _comment.Text = payload.text

                        return _newValue
                    } else {
                        return task
                    }
                })

        case DELETE_COMMENT:
            return state
                .update("task", (task) => {
                    const _index = task.Log.findIndex(item => item.Id === payload.id)

                    if (_index > -1) {
                        const _newValue = {...task}
                        _newValue.Log.splice(_index, 1)

                        return _newValue
                    } else {
                        return task
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
export const taskSelector = createSelector(stateSelector, state => state.task)
export const usersSelector = createSelector(stateSelector, state => state.users)
export const elementsSelector = createSelector(stateSelector, state => state.elements)
export const currentElementSelector = createSelector(stateSelector, state => state.currentElement)
export const accessDeniedSelector = createSelector(stateSelector, state => state.accessDenied)


/**
 * Action Creators
 * */
export const getTask = (taskId: number, notificationUuid = null) => {
    return {type: GET_TASK_REQUEST, payload: {taskId, notificationUuid}}
}

export const createTask = (processId: number) => {
    return {type: CREATE_TASK_REQUEST, payload: processId}
}

export const saveTask = (task: UpdatingTask) => {
    return {type: SAVE_TASK_REQUEST, payload: task}
}

export const deleteTask = (data: ProcessTask) => {
    return {type: DELETE_TASK_REQUEST, payload: data}
}

export const getProcessElement = (elementId: number) => {
    return {type: GET_PROCESS_ELEMENT_REQUEST, payload: elementId}
}

export const saveDependencies = (data) => {
    return {type: SAVE_TASK_LINKS_REQUEST, payload: data}
}

export const saveComment = (comment: UpdatingCommentData) => {
    return {type: SAVE_COMMENT_REQUEST, payload: comment}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(CREATE_TASK_REQUEST, createTaskSaga),
        takeEvery(GET_TASK_REQUEST, getTaskSaga),
        takeEvery(SAVE_TASK_REQUEST, saveTaskSaga),
        takeEvery(DELETE_TASK_REQUEST, deleteTaskSaga),
        takeEvery(GET_PROCESS_ELEMENT_REQUEST, getProcessElementSaga),
        takeEvery(SAVE_TASK_LINKS_REQUEST, saveDependenciesSaga),
        takeEvery(SAVE_COMMENT_REQUEST, saveCommentSaga),
    ])
}


function* getTaskSaga(data) {
    yield put({type: GET_TASK_START})
    try {
        let _task = yield call(_fetchTask, data.payload.taskId, data.payload.notificationUuid);

        const _user = yield select(userSelector)

        yield call(getDictionaryData, _task)

        if (_task.Log && _task.Log.length) {
            _task.Log = _task.Log.sort((a, b) => {return moment(a).isBefore(b) ? 1 : -1})
            const _lastComment = _task.Log[0]

            _task.isUserLastComment = _lastComment && _lastComment.User.Id === _user.Id
        } else {
            _task.isUserLastComment = false
        }

        taskController.calc({user: _user, task: _task})

        yield put({type: GET_TASK_SUCCESS, payload: _task})
    } catch (e) {
        yield put({type: GET_TASK_FAIL});

        if (e.status === 403) {
            yield put({type: SET_ACCESS_DENIED})
        } else {
            yield put(showErrorMessage(e.message))
        }
    }
}

const _fetchTask = (taskId, notificationUuid = null) => {
    return commonGetQuery(`/api/pm/task/${taskId}${notificationUuid ? '?notification='+notificationUuid : ''}`)

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

        const task: UpdatingTask = payload
        const oldTask = yield select(taskSelector);

        if ((task.State === TASK_STATE.QUESTION.value) &&
            !task.Comment && oldTask.State !== TASK_STATE.QUESTION.value) {
            yield put({type: SAVE_TASK_FAIL});
            yield put(showErrorMessage("Необходимо указать вопрос в тексте комментария"))
            return
        }

        const _creatingTask = task.Id === -1,
            result =  _creatingTask ?
                yield call(_postTask, task)
                :
                yield call(_putTask, task),
            id = task.Id,
            elementId = task.ElementId

        yield put({type: SAVE_TASK_SUCCESS, payload: result})

        yield put(reset('TASK_EDITOR'))

        if (!_creatingTask) {
            yield all([
                put(getTask(id)),
                put(getProcessElement(elementId)),
            ])
        } else {
            console.log(result)
            yield all([
                put(getTask(result.id)),
                put(getProcessElement(null)),
            ])
        }
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

const _postTask = (data) => {
    delete data.Id

    return fetch(`/api/pm/task`, {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
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


function* createTaskSaga({payload}) {
    yield put({type: CREATE_TASK_START})
    try {
        const _user = yield select(userSelector)

        const _newTask = {
            Id: -1,
            IsActive: true,
            IsFinal: false,
            isAutomatic: false,
            Process: {Id: payload},
            Name: "Новая задача",
            Element: {Id: null},
            IsElemReady: false,
            Description: "",
            WriteFieldSet: "",
            Dependencies: [],
            Log: [],
        }

        taskController.calc({user: _user, task: _newTask})

        yield call(getDictionaryData, _newTask)

        yield put({type: CREATE_TASK_SUCCESS, payload: _newTask})
    } catch (e) {
        yield put({type: CREATE_TASK_FAIL})
        yield put(showErrorMessage(e.message))
    }
}


function* getDictionaryData(task) {
    const _hasRights = yield select(hasElementEditorRights)

    let _users = []
    if (_hasRights) {
        _users = yield call(_getUsers)
    } else {
        if (task.Executor) {
            _users.push({Id: task.Executor.Id, DisplayName: task.Executor.DisplayName})
        }
    }

    yield put({type: SET_USERS, payload: _users})

    if (task.Process && task.Process.Id) {
        const _elements = yield call(_getProcessElements, task.Process.Id)
        yield put({type: SET_ELEMENTS, payload: _elements})
    }
}


function* deleteTaskSaga({payload}) {
    const message: Message = {
        content: `Удалить задачу #${payload.taskId}?`,
        title: "Подтверждение удаления"
    }

    yield put(showUserConfirmation(message))

    const {accept} = yield race({
        accept: take(MODAL_MESSAGE_ACCEPT),
        decline: take(MODAL_MESSAGE_DECLINE)
    })

    if (!accept) return

    yield put({type: DELETE_TASK_START})
    try {
        yield call(_deleteTask, payload.taskId)
        yield put(getProcess(payload.processId))

        yield put({type: DELETE_TASK_SUCCESS,})
    } catch (e) {
        yield put({type: DELETE_TASK_FAIL})
        yield put(showError({content: e.message}))
    }
}

const _deleteTask = (taskId: number) => {
    return fetch(`/api/pm/task/${taskId}`, {
        method: 'DELETE',
        headers: { "Content-type": "application/json" },
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}


function* saveDependenciesSaga({payload}) {
    yield put({type: SAVE_TASK_LINKS_START})

    try {
        const actions = payload.deps
            .map((item) => {
                return item.state === "DELETED"
                    ? call(_deleteDependence, {DepTaskId: payload.taskId, TaskId: item.taskId})
                    :
                    item.state === "ADDED" ?
                        call(_addDependence, {DepTaskId: payload.taskId, TaskId: item.taskId})
                        :
                        null
            })
            .filter(item => item)

        for (let action of actions) {
            yield action
        }

        yield put({type: SAVE_TASK_LINKS_SUCCESS})
    } catch (e) {
        yield put({type: SAVE_TASK_LINKS_FAIL})
        yield put(showError({content: e.message}))
    }
}

const _addDependence = (body) => {
    return fetch("/api/pm/task-dep", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(body),
    })
        .then(checkStatus)
        .then(parseJSON)
}

const _deleteDependence = (body) => {
    return fetch("/api/pm/task-dep", {
        method: 'DELETE',
        headers: { "Content-type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(body),
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* saveCommentSaga({payload}) {
    const comment: UpdatingCommentData = payload

    yield put({type: SAVE_COMMENT_START})
    try {
        if (comment) {
            if (comment.action === COMMENT_ACTION.UPDATE) {
                yield call(_updateComment, comment)

                yield put({type: SET_COMMENT, payload: comment})
            } else if (comment.action === COMMENT_ACTION.DELETE) {
                yield call(_deleteComment, comment.id)

                yield put({type: DELETE_COMMENT, payload: comment})
            }
        }
    } catch (e) {
        yield put({type: SAVE_COMMENT_FAIL})
        yield put(showError({content: e.message}))
    }

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
