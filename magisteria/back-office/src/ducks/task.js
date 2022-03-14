import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery, update} from "common-tools/fetch-tools";
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
import {checkStatus, parseJSON} from "#common/tools/fetch-tools";
import {COMMENT_ACTION} from "../constants/common";
import {getProcess} from "tt-ducks/process";
import {race} from "redux-saga/effects";
import taskController from "../tools/task-controller";
import moment from "moment";
import {TASK_STATE} from "../constants/states";
import {paramsSelector} from "./route";
import type {ProcessTask, UpdatingCommentData, UpdatingTask,} from "../types/task";
import type {Message} from "../types/messages";

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


const GET_TASK_TYPES =`${prefix}/GET_TASK_TYPES`
const LOAD_TASK_TYPES =`${prefix}/LOAD_TASK_TYPES`
const GET_TASK_TYPE =`${prefix}/GET_TASK_TYPE`
const LOAD_TASK_TYPE =`${prefix}/LOAD_TASK_TYPE`
const UPDATE_TASK_TYPE = `${prefix}/UPDATE_TASK_TYPE`
const DELETE_TASK_TYPE =`${prefix}/DELETE_TASK_TYPE`
const CREATE_TASK_TYPE =`${prefix}/CREATE_TASK_TYPE`
const SET_CURRENT_TASK_TYPE = `${prefix}/SET_CURRENT_TASK_TYPE`
const SET_TASK_TYPES = `${prefix}/SET_TASK_TYPES`
const SET_NEW_TASK_CREATION = `${prefix}/SET_NEW_TASK_CREATION`
const SELECT_TASK_TYPE = `${prefix}/SELECT_TASK_TYPE`

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;

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
});

// const TaskTypes = List([]);
/**
 * Reducer
 * */
export const ReducerRecord = Record({
    task: null,
    taskTypes: [],
    currentTaskType: null,
    accessDenied: false,
    users: [],
    elements: [],
    fetching: false,
    currentElement: new Element()
});


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case SET_TASK_TYPES:
            return state.set('taskTypes', payload);


        case SET_CURRENT_TASK_TYPE:
            console.log('SET_CURRENT_TASK_TYPE', payload);
            return state.set('currentTaskType', payload);

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

        case SUCCESS_REQUEST:
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
        case FAIL_REQUEST:
            return state
                .set("fetching", false)

        case GET_PROCESS_ELEMENT_SUCCESS:
            return state
                .set("currentElement", new Element(payload))
                .set("fetching", false)

        case SAVE_TASK_START:
        case SAVE_TASK_LINKS_START:
        case START_REQUEST:
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
export const taskTypesSelector = createSelector(stateSelector, state => state.taskTypes)
export const usersSelector = createSelector(stateSelector, state => state.users)
export const elementsSelector = createSelector(stateSelector, state => state.elements)
export const currentElementSelector = createSelector(stateSelector, state => state.currentElement)
export const currentTaskTypeSelector = createSelector(stateSelector, state => state.currentTaskType);
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

export const getTaskTypes = () => {
    return {type: GET_TASK_TYPES}
};

export const getTaskType = (id) => {
    return {type: GET_TASK_TYPE, payload: id}
};

export const updateTaskType = (id, body) => {
    return {type: UPDATE_TASK_TYPE, payload: {id, body}};
};

export const deleteTaskType = (id) => {
    return {type: DELETE_TASK_TYPE, payload: id};
};

export const selectTaskType = (id) => {
    return {type: SELECT_TASK_TYPE, payload: id};
};

export const setNewTaskType = () => {
    return {type: SET_CURRENT_TASK_TYPE, payload: {
            'Code': '',
            'Name': '',
            'Description': '',
            'GuiPermissions': {
                // "dsb": {
                //     "al": 0
                // }
            },
            'Roles': [
                // 1,
                // 2,
                // 3
            ]
    }};
};

export const createTaskType = (newTaskType) => {
    return {type: CREATE_TASK_TYPE, payload: newTaskType}
};


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
        takeEvery(GET_TASK_TYPES, getTaskTypesSaga),
        takeEvery(GET_TASK_TYPE, getTaskTypeSaga),
        takeEvery(UPDATE_TASK_TYPE, updateTaskTypeSaga),
        takeEvery(DELETE_TASK_TYPE, deleteTaskTypeSaga),
        takeEvery(SELECT_TASK_TYPE, selectTaskTypeSaga),
        takeEvery(CREATE_TASK_TYPE, createTaskTypeSaga)
    ])
};


function* createTaskTypeSaga(data) {
    yield put({type: START_REQUEST});
    const newTaskType = {
        Code: data.payload.code,
        Name: data.payload.name,
        Description: data.payload.description,
        Roles: data.payload.roles,
    };

    try {
        const taskType = yield call(createTaskTypeReq, newTaskType); //todo check status
        yield put({type: SUCCESS_REQUEST});
        const taskTypes = yield select(taskTypesSelector);
        taskTypes.push(newTaskType);
        yield put({type: SET_TASK_TYPES, payload: taskTypes})
        console.log(JSON.stringify(taskTypes));
        // yield put({type: LOAD_TASK_TYPES});
    } catch (e) {
        yield put({type: FAIL_REQUEST});

        if (e.status === 403) {
            yield put({type: SET_ACCESS_DENIED})
        } else {
            yield put(showErrorMessage(e.message))
        }
    }
}

function* getTaskTypesSaga(data) {
    yield put({type: START_REQUEST});

    try {

        const params = yield select(paramsSelector);
        const taskTypes = yield call(getTaskTypesReq, params);

        yield put({type: SET_TASK_TYPES, payload: taskTypes})
        // taskController.calc({user: _user, task: _task})
        //
        yield put({type: SUCCESS_REQUEST})
    } catch (e) {
        yield put({type: FAIL_REQUEST});

        if (e.status === 403) {
            yield put({type: SET_ACCESS_DENIED})
        } else {
            yield put(showErrorMessage(e.message))
        }
    }
}

function* getTaskTypeSaga(data) {
    yield put({type: START_REQUEST});
    try {
        const taskType = yield call(getTaskTypeReq, data.payload);
        yield put({type: SET_CURRENT_TASK_TYPE, payload: taskType});
        yield put({type: SUCCESS_REQUEST})
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message))
    }
}

function* updateTaskTypeSaga(data) {
    yield put({type: START_REQUEST});
    try {
        const taskType = yield call(updateTaskTypeReq, data.payload.id, data.payload.body); //todo check status

        const taskTypes = yield select(taskTypesSelector);

        const taskTypeIndexToUpdate = taskTypes.findIndex(tType => tType.Id === taskType.Id);
        if(taskTypeIndexToUpdate >= 0){
            taskTypes.splice(taskTypeIndexToUpdate, 1, taskType);
            yield put({type: SET_TASK_TYPES, payload: taskTypes})
        }
        yield put({type: SUCCESS_REQUEST})
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message))
    }
}

function* deleteTaskTypeSaga(data) {
    yield put({type: START_REQUEST});
    try {
        const taskType = yield call(deleteTaskTypeReq, data.payload);

        console.dir('taskType', taskType);

        // const taskTypes = yield select(taskTypesSelector);
        //
        // const taskTypeIndexToDelete = taskTypes.findIndex(tType => tType.Id === taskType.Id);

        yield put({type: SUCCESS_REQUEST})
        // if(taskTypeIndexToDelete >= 0){
        //     taskTypes.splice(taskTypeIndexToDelete, 1);
            yield put({type: GET_TASK_TYPES})
        // }
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message))
    }
}

function* selectTaskTypeSaga(data) {
    const taskTypes =  yield select(taskTypesSelector);
    if(data.payload){
        const taskType = taskTypes.find(tType => tType.Id === data.payload);
        console.log('taskType', taskType);

        if(taskType){
            console.log('put');
            yield put({type: SET_CURRENT_TASK_TYPE, payload: taskType});
        }
    } else {
        console.log('set to null');
        yield put({type: SET_CURRENT_TASK_TYPE, payload: null});
    }
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

const getTaskTypesReq = (params) => {
    let url = `/api/pm/task-type-list${params ? `?${params}` : ''}`;
    return commonGetQuery(url);
};

const getTaskTypeReq = (id) => commonGetQuery(`/api/pm/task-type/${id}`);

const updateTaskTypeReq = (id, body) => update(`/api/pm/task-type/${id}`, JSON.stringify(body));

const createTaskTypeReq = (body) => {
    return fetch("/api/pm/task-type", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(body),
    })
        .then(checkStatus)
        .then(parseJSON)
};

const deleteTaskTypeReq = (id) => {
    return fetch(`/api/pm/task-type/${id}`, {
        method: 'DELETE',
        headers: { "Content-type": "application/json" },
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};
