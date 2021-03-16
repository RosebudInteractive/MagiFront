import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";

import PROCESS from "../mock-data/process-1"
import {hasSupervisorRights, userSelector} from "tt-ducks/auth";
import {reset} from "redux-form";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import type {UpdatingCommentData, UpdatingProcess, UpdatingProcessData} from "../types/process";
import {COMMENT_ACTION} from "../constants/common";

/**
 * Constants
 * */
export const moduleName = 'process'
const prefix = `${appName}/${moduleName}`

const GET_PROCESS_REQUEST = `${prefix}/GET_PROCESS_REQUEST`
const GET_PROCESS_START = `${prefix}/GET_PROCESS_START`
const GET_PROCESS_SUCCESS = `${prefix}/GET_PROCESS_SUCCESS`
const GET_PROCESS_FAIL = `${prefix}/GET_PROCESS_FAIL`

const SAVE_PROCESS_REQUEST = `${prefix}/SAVE_PROCESS_REQUEST`
const SAVE_PROCESS_START = `${prefix}/SAVE_PROCESS_START`
const SAVE_PROCESS_SUCCESS = `${prefix}/SAVE_PROCESS_SUCCESS`
const SAVE_PROCESS_FAIL = `${prefix}/SAVE_PROCESS_FAIL`

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
    process: null,
    users: [],
    elements: [],
    fetching: false,
    currentElement: new Element()
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_PROCESS_START:
            return state
                .set("fetching", true)
                .set("process", null)
                .set("currentElement", new Element())

        case GET_PROCESS_SUCCESS:
            return state
                .set("fetching", false)
                .set("process", payload)

        case GET_PROCESS_FAIL:
        case SAVE_PROCESS_FAIL:
        case GET_PROCESS_ELEMENT_FAIL:
            return state
                .set("fetching", false)

        case GET_PROCESS_ELEMENT_SUCCESS:
            return state
                .set("currentElement", new Element(payload))
                .set("fetching", false)

        case SAVE_PROCESS_START:
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
export const processSelector = createSelector(stateSelector, state => state.process)
export const usersSelector = createSelector(stateSelector, state => state.users)
export const elementsSelector = createSelector(stateSelector, state => state.elements)
export const currentElementSelector = createSelector(stateSelector, state => state.currentElement)


/**
 * Action Creators
 * */
export const getProcess = (processId: number) => {
    return {type: GET_PROCESS_REQUEST, payload: processId}
}

export const saveProcess = (data: UpdatingProcessData) => {
    return {type: SAVE_PROCESS_REQUEST, payload: data}
}

// export const getProcessElement = (elementId: number) => {
//     return {type: GET_PROCESS_ELEMENT_REQUEST, payload: elementId}
// }


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_PROCESS_REQUEST, getProcessSaga),
        takeEvery(SAVE_PROCESS_REQUEST, saveProcessSaga),
        // takeEvery(GET_PROCESS_ELEMENT_REQUEST, getProcessElementSaga),
    ])
}


function* getProcessSaga(data) {
    yield put({type: GET_PROCESS_START})
    try {
        let _process = yield call(_fetchProcess, data.payload)

        const _user = yield select(userSelector),
            _hasSupervisorRights = yield select(hasSupervisorRights)

        // let _users = []
        // if (_hasSupervisorRights) {
            const _users = yield call(_getUsers)
        // } else {
        //     if (_task.Executor) {
        //         _users.push({Id: _task.Executor.Id, DisplayName: _task.Executor.DisplayName})
        //     }
        // }

        yield put({type: SET_USERS, payload: _users})

        // if (_task.Process && _task.Process.Id) {
        //     const _elements = yield call(_getProcessElements, _task.Process.Id)
        //     yield put({type: SET_ELEMENTS, payload: _elements})
        // }

        // const _lastComment = _task.Log && _task.Log.length && _task.Log[_task.Log.length - 1],
        //     _isUserComment = _lastComment && _lastComment.User.Id === _user.Id
        //
        // _task.UserLastComment = _isUserComment ? { Id: _lastComment.Id, Text: _lastComment.Text } : null

        yield put({type: GET_PROCESS_SUCCESS, payload: _process})
    } catch (e) {
        yield put({type: GET_PROCESS_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _fetchProcess = (processId) => {
    return Promise.resolve(PROCESS)
    // return commonGetQuery(`/api/pm/process/${processId}`)
}

const _getUsers = () => {
    return commonGetQuery("/api/users/list?role=a,pma,pms,pme,pmu")
}

const _getProcessElements = (processId) => {
    return commonGetQuery(`/api/pm/process/${processId}/elements`)
}

function* saveProcessSaga({payload}) {
    yield put({type: SAVE_PROCESS_START})
    try {
        const data: UpdatingProcessData = payload,
            result = yield call(_putProcess, data.process),
            id = data.process.Id
            // elementId = data.task.ElementId

        yield put({type: SAVE_PROCESS_SUCCESS, payload: result})

        console.log(data)

        if (data.comment) {
            if (data.comment.action === COMMENT_ACTION.UPDATE) {
                yield call(_updateComment, data.comment)
            } else if (data.comment.action === COMMENT_ACTION.DELETE) {
                yield call(_deleteComment, data.comment.id)
            }
        }

        yield put(reset('PROCESS_EDITOR'))
        yield all([
            put(getProcess(id)),
            put(getProcessElement(elementId)),
            ])
    } catch (e) {
        yield put({type: SAVE_PROCESS_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _putProcess = (data: UpdatingProcess) => {
    return fetch(`/api/pm/process/${data.Id}`, {
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

// function* getProcessElementSaga(data) {
//     if (!data.payload) {
//         yield put({type: CLEAR_PROCESS_ELEMENT})
//     } else {
//         yield put({type: GET_PROCESS_ELEMENT_START})
//         try {
//             const element = yield call(_getProcessElementData, data.payload)
//
//             yield put({type: GET_PROCESS_ELEMENT_SUCCESS, payload: element})
//         } catch (e) {
//             yield put({type: GET_PROCESS_ELEMENT_FAIL})
//             yield put(showErrorMessage(e.message))
//         }
//     }
// }

// const _getProcessElementData = (elementId) => {
//     return commonGetQuery(`/api/pm/process-elem/${elementId}`)
// }
