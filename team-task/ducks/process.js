import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";

import PROCESS from "../mock-data/process-1"
import {hasSupervisorRights,} from "tt-ducks/auth";
import {reset} from "redux-form";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import type {UpdatingCommentData, UpdatingProcess, UpdatingProcessData} from "../types/process";
import {COMMENT_ACTION} from "../constants/common";
import {push} from "react-router-redux/src";

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

const SET_SUPERVISORS = `${prefix}/SET_SUPERVISORS`
const SET_EDITORS = `${prefix}/SET_EDITORS`

const GO_BACK_REQUEST = `${prefix}/GO_BACK_REQUEST`


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
    supervisors: [],
    editors: [],
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
            return state
                .set("fetching", false)

        case SAVE_PROCESS_START:
            return state
                .set("fetching", true)

        case SET_SUPERVISORS:
            return state
                .set("supervisors", payload)

        case SET_EDITORS:
            return state
                .set("editors", payload)

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
export const supervisorsSelector = createSelector(stateSelector, state => state.supervisors)
export const editorsSelector = createSelector(stateSelector, state => state.editors)
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

export const goBack = () => {
    return {type: GO_BACK_REQUEST}
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
        takeEvery(GO_BACK_REQUEST, goBackSaga),
    ])
}


function* getProcessSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights)

    if (!_hasSupervisorRights) return

    yield put({type: GET_PROCESS_START})
    try {
        let _process = yield call(_fetchProcess, data.payload)
        const _supervisors = yield call(_getSupervisors),
            _editors = yield call(_getEditors)

        yield put({type: SET_SUPERVISORS, payload: _supervisors})
        yield put({type: SET_EDITORS, payload: _editors})

        yield put({type: GET_PROCESS_SUCCESS, payload: _process})
    } catch (e) {
        yield put({type: GET_PROCESS_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _fetchProcess = (processId) => {
    return commonGetQuery(`/api/pm/process/${processId}`)
}

const _getSupervisors = () => {
    return commonGetQuery("/api/users/list?role=a,pma,pms")
}

const _getEditors = () => {
    return commonGetQuery("/api/users/list?role=a,pma,pms,pme")
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

function* goBackSaga() {
    yield put(push(`/processes`))

}


