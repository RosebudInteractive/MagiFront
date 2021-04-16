import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import 'whatwg-fetch';
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showError, showErrorMessage} from "tt-ducks/messages";
import {hasSupervisorRights,} from "tt-ducks/auth";
import {reset} from "redux-form";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import type {
    CreatingElement,
    CreatingProcess,
    CreatingProcessParams,
    UpdatingElement,
    UpdatingProcess
} from "../types/process";
import {push} from "react-router-redux/src";
import {goToProcess} from "tt-ducks/processes";

/**
 * Constants
 * */
export const moduleName = 'process'
const prefix = `${appName}/${moduleName}`

const GET_PROCESS_REQUEST = `${prefix}/GET_PROCESS_REQUEST`
const GET_PROCESS_START = `${prefix}/GET_PROCESS_START`
const GET_PROCESS_SUCCESS = `${prefix}/GET_PROCESS_SUCCESS`
const GET_PROCESS_FAIL = `${prefix}/GET_PROCESS_FAIL`

const CREATE_PROCESS_REQUEST = `${prefix}/CREATE_PROCESS_REQUEST`
const CREATE_PROCESS_START = `${prefix}/CREATE_PROCESS_START`
const CREATE_PROCESS_SUCCESS = `${prefix}/CREATE_PROCESS_SUCCESS`
const CREATE_PROCESS_FAIL = `${prefix}/CREATE_PROCESS_FAIL`


const SAVE_PROCESS_REQUEST = `${prefix}/SAVE_PROCESS_REQUEST`
const SAVE_PROCESS_START = `${prefix}/SAVE_PROCESS_START`
const SAVE_PROCESS_SUCCESS = `${prefix}/SAVE_PROCESS_SUCCESS`
const SAVE_PROCESS_FAIL = `${prefix}/SAVE_PROCESS_FAIL`

const ADD_ELEMENT_REQUEST = `${prefix}/ADD_ELEMENT_REQUEST`
const UPDATE_ELEMENT_REQUEST = `${prefix}/UPDATE_ELEMENT_REQUEST`
const DELETE_ELEMENT_REQUEST = `${prefix}/DELETE_ELEMENT_REQUEST`
const OPERATION_WITH_ELEMENT_START = `${prefix}/OPERATION_WITH_ELEMENT_START`
const OPERATION_WITH_ELEMENT_SUCCESS = `${prefix}/OPERATION_WITH_ELEMENT_SUCCESS`
const OPERATION_WITH_ELEMENT_FAIL = `${prefix}/OPERATION_WITH_ELEMENT_FAIL`

const SET_SUPERVISORS = `${prefix}/SET_SUPERVISORS`
const SET_EDITORS = `${prefix}/SET_EDITORS`
const SET_ELEMENTS = `${prefix}/SET_ELEMENTS`
const SET_LESSONS = `${prefix}/SET_LESSONS`

const GO_BACK_REQUEST = `${prefix}/GO_BACK_REQUEST`

const CLEAR_PROCESS = `${prefix}/CLEAR_PROCESS`


/**
 * Reducer
 * */
export const ReducerRecord = Record({
    process: null,
    supervisors: [],
    editors: [],
    elements: [],
    lessons: [],
    fetching: false,
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_PROCESS_START:
        case CREATE_PROCESS_START:
            return state
                .set("fetching", true)
                .set("process", null)

        case CREATE_PROCESS_SUCCESS:
            return state
                .set("fetching", false)

        case GET_PROCESS_SUCCESS:
            return state
                .set("fetching", false)
                .set("process", payload)

        case CREATE_PROCESS_FAIL:
        case GET_PROCESS_FAIL:
        case SAVE_PROCESS_FAIL:
        case OPERATION_WITH_ELEMENT_FAIL:
            return state
                .set("fetching", false)

        case SAVE_PROCESS_START:
        case OPERATION_WITH_ELEMENT_START:
            return state
                .set("fetching", true)

        case SET_SUPERVISORS:
            return state
                .set("supervisors", payload)

        case SET_EDITORS:
            return state
                .set("editors", payload)

        case SET_ELEMENTS:
            return state
                .set("elements", payload)

        case SET_LESSONS:
            return state
                .set("lessons", payload)

        case CLEAR_PROCESS:
            return state
                .set("process", null)

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
export const elementsSelector = createSelector(stateSelector, state => state.elements)
export const lessonsSelector = createSelector(stateSelector, state => state.lessons)

/**
 * Action Creators
 * */
export const createProcess = (data: CreatingProcess) => {
    return {type: CREATE_PROCESS_REQUEST, payload: data}
}

export const getProcess = (processId: number) => {
    return {type: GET_PROCESS_REQUEST, payload: processId}
}

export const saveProcess = (process: UpdatingProcess) => {
    return {type: SAVE_PROCESS_REQUEST, payload: process}
}

export const addElement = (element: CreatingElement) => {
    return {type: ADD_ELEMENT_REQUEST, payload: element}
}

export const updateElement = (element: UpdatingElement) => {
    return {type: UPDATE_ELEMENT_REQUEST, payload: element}
}

export const deleteElement = (elementId: number) => {
    return {type: DELETE_ELEMENT_REQUEST, payload: elementId}
}

export const goBack = () => {
    return {type: GO_BACK_REQUEST}
}

export const clear = () => {
    return {type: CLEAR_PROCESS}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(CREATE_PROCESS_REQUEST, createProcessSaga),
        takeEvery(GET_PROCESS_REQUEST, getProcessSaga),
        takeEvery(SAVE_PROCESS_REQUEST, saveProcessSaga),
        takeEvery(GO_BACK_REQUEST, goBackSaga),
        takeEvery(ADD_ELEMENT_REQUEST, addElementSaga),
        takeEvery(UPDATE_ELEMENT_REQUEST, updateElementSaga),
        takeEvery(DELETE_ELEMENT_REQUEST, deleteElementSaga),
    ])
}

function* createProcessSaga({payload}) {
    const data: CreatingProcess = {
        ...payload,
        "StructName": "Lesson Process Proto"
    }

    console.log(data)

    yield put({type: CREATE_PROCESS_START})
    try {
        const result = yield call(_postProcess, data)
        yield put(goToProcess(result.id))
        yield put({type: CREATE_PROCESS_SUCCESS})
    } catch (e) {
        yield put({type: CREATE_PROCESS_FAIL})
        yield put(showError({content: e.message}))
    }
}

const _postProcess = (data: CreatingProcess) => {
    return fetch("/api/pm/process", {
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

function* getProcessSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights)

    if (!_hasSupervisorRights) return

    yield put({type: GET_PROCESS_START})
    try {
        let _process = yield call(_fetchProcess, data.payload)
        const [_supervisors, _editors, _elements, _lessons] = yield all([
            call(_getSupervisors),
            call(_getEditors),
            call(_getElements, _process.Id),
            call(_getLessons),
        ])

        yield put({type: SET_SUPERVISORS, payload: _supervisors})
        yield put({type: SET_EDITORS, payload: _editors})
        yield put({type: SET_ELEMENTS, payload: _elements})
        yield put({type: SET_LESSONS, payload: _lessons})

        yield put({type: GET_PROCESS_SUCCESS, payload: _process})
    } catch (e) {
        yield put({type: GET_PROCESS_FAIL})
        yield put(showError({content: e.message}))
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

const _getElements = (processId) => {
    return commonGetQuery(`/api/pm/process-struct/${processId}/elements`)
}

const _getLessons = () => {
    return commonGetQuery("/api/lessons-list")
}

function* saveProcessSaga({payload}) {
    yield put({type: SAVE_PROCESS_START})
    try {
        const process: UpdatingProcess = payload,
            result = yield call(_putProcess, process),
            id = process.Id

        yield put({type: SAVE_PROCESS_SUCCESS, payload: result})

        yield put(reset('PROCESS_EDITOR'))
        yield put(getProcess(id))
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

function* addElementSaga({payload: element}) {
    yield put({type: OPERATION_WITH_ELEMENT_START})
    try {
        const process = yield select(processSelector)
        const _element: CreatingElement = {...element}

        _element.ProcessId = process.Id
        yield call(_insertElement, _element)
        yield put({type: OPERATION_WITH_ELEMENT_SUCCESS,})

        yield put(getProcess(process.Id))
    } catch (e) {
        yield put({type: OPERATION_WITH_ELEMENT_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

function* updateElementSaga({payload: element}) {
    yield put({type: OPERATION_WITH_ELEMENT_START})
    try {
        const process = yield select(processSelector)
        yield call(_updateElement, element)
        yield put({type: OPERATION_WITH_ELEMENT_SUCCESS,})

        yield put(getProcess(process.Id))
    } catch (e) {
        yield put({type: OPERATION_WITH_ELEMENT_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

function* deleteElementSaga({payload: elementId}) {
    yield put({type: OPERATION_WITH_ELEMENT_START})
    try {
        const process = yield select(processSelector)
        yield call(_deleteElement, elementId)
        yield put({type: OPERATION_WITH_ELEMENT_SUCCESS,})

        yield put(getProcess(process.Id))
    } catch (e) {
        yield put({type: OPERATION_WITH_ELEMENT_FAIL})
        yield put(showErrorMessage(e.message))
    }
}

const _insertElement = (element: CreatingElement) => {
    return fetch("/api/pm/process-elem", {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(element),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

const _updateElement = (element: UpdatingElement) => {
    return fetch(`/api/pm/process-elem/${element.ElementId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(element),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

const _deleteElement = (elementId: number) => {
    return fetch(`/api/pm/process-elem/${elementId}`, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json"
        },
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}
