import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import {all, put, select, takeEvery} from "@redux-saga/core/effects";
import type {GridSortOrder} from "../types/grid";
import {GRID_SORT_DIRECTION} from "../constants/common";
import {push} from "react-router-redux/src";
import $ from "jquery";
import {GET_TASKS_FAIL, GET_TASKS_SUCCESS} from "tt-ducks/tasks";
import {GET_PROCESSES_FAIL, GET_PROCESSES_SUCCESS} from "tt-ducks/processes";

/**
 * Constants
 * */
export const moduleName = 'route'
const prefix = `${appName}/${moduleName}`

const SET_PATHNAME_REQUEST = `${prefix}/SET_PATHNAME_REQUEST`
const SET_PATHNAME = `${prefix}/SET_PATHNAME`

const APPLY_FILTER_REQUEST = `${prefix}/APPLY_FILTER_REQUEST`
const APPLY_FILTER = `${prefix}/APPLY_FILTER`
const APPLY_FILTER_SILENTLY = `${prefix}/APPLY_FILTER_SILENTLY`

const SET_GRID_SORT_ORDER_REQUEST = `${prefix}/SET_GRID_SORT_ORDER_REQUEST`
const SET_GRID_SORT_ORDER = `${prefix}/SET_GRID_SORT_ORDER`

const SET_ACTIVE_TASK_ID_REQUEST = `${prefix}/SET_ACTIVE_TASK_ID_REQUEST`
const SET_ACTIVE_TASK_ID = `${prefix}/SET_ACTIVE_TASK_ID`

const BUILD_LOCATION_REQUEST = `${prefix}/BUILD_LOCATION_REQUEST`
const BUILD_LOCATION = `${prefix}/BUILD_LOCATION`
const CLEAR_GUARD = `${prefix}/CLEAR_GUARD`

const SET_INIT_STATE_REQUEST = `${prefix}/SET_INIT_STATE_REQUEST`



/**
 * Reducer
 * */
export const ReducerRecord = Record({
    path: "",
    order: "",
    filter: {},
    refreshGuard: false,
    activeTask: null,
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case SET_PATHNAME:
            return state
                .set("path", payload)
                .set("order", "")
                .set("filter", {})
                .set("activeTask", null)

        case SET_GRID_SORT_ORDER:
            return state
                .set("order", payload)

        case SET_ACTIVE_TASK_ID:
            return state
                .set("activeTask", payload)

        case APPLY_FILTER:
            return state
                .set("filter", payload)

        case BUILD_LOCATION:
            return state
                .set("refreshGuard", true)

        case GET_TASKS_SUCCESS:
        case GET_TASKS_FAIL:
        case GET_PROCESSES_SUCCESS:
        case GET_PROCESSES_FAIL:
        case CLEAR_GUARD:
            return state
                .set("refreshGuard", false)

        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
const pathSelector = createSelector(stateSelector, state => state.path)
const refreshGuardSelector = createSelector(stateSelector, state => state.refreshGuard)
export const activeTaskIdSelector = createSelector(stateSelector, state => state.activeTask)
export const paramsSelector = createSelector(stateSelector, (state) => {
    const params = {...state.filter},
        order = state.order;

    if (order) { params.order = order }
    if (state.activeTask) { params.activeTask = state.activeTask }

    return  $.param(params);
});

//get non-parametrized filter
export const filterSelector = createSelector(stateSelector, (state) => {
    const params = {...state.filter};
    return params;
});


/**
 * Action Creators
 * */
export const setPathname = (path: string) => {
    return {type: SET_PATHNAME_REQUEST, payload: path}
}

export const applyFilter = (filter) => {
    return {type: APPLY_FILTER_REQUEST, payload: filter}
}

export const setGridSortOrder = (order: GridSortOrder) => {
    return {type: SET_GRID_SORT_ORDER_REQUEST, payload: order}
}

export const setActiveTaskId = (taskId: number) => {
    return {type: SET_ACTIVE_TASK_ID_REQUEST, payload: taskId}
}

export const buildLocation = (replace: boolean = false) => {
    return {type: BUILD_LOCATION_REQUEST, payload: replace}
}

export const setInitState = (data) => {
    return {type: SET_INIT_STATE_REQUEST, payload: data}
}

export const clearLocationGuard = () => {
    return { type: CLEAR_GUARD }
}

// export const applyFilterSilently = (filter) => {  //silently without add a string params to url
//     return {type: APPLY_FILTER_SILENTLY, payload: filter}
// };


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(SET_PATHNAME_REQUEST, setPathnameSaga),
        takeEvery(APPLY_FILTER_REQUEST, applyFilterSaga),
        takeEvery(SET_GRID_SORT_ORDER_REQUEST, setGridSortOrderSaga),
        takeEvery(SET_ACTIVE_TASK_ID_REQUEST, setActiveTaskIdSaga),
        takeEvery(BUILD_LOCATION_REQUEST, buildLocationSaga),
        takeEvery(SET_INIT_STATE_REQUEST, setInitStateSaga),
        // takeEvery(APPLY_FILTER_SILENTLY, applyFilterSilentlySaga)
    ])
};

// function* applyFilterSilentlySaga(data){
//     try {
//         const filter = yield select(filterSelector);
//         yield put({type: APPLY_FILTER, payload: {...filter,...data.payload}});
//     }catch (e) {
//         showErrorMessage(e);
//     }
// }

function* setPathnameSaga(data) {
    const currentPath = yield select(pathSelector)

    if (data.payload !== currentPath) {
        yield put({type: SET_PATHNAME, payload: data.payload})
    }
}

function* applyFilterSaga(data) {
    const guard = yield select(refreshGuardSelector)

    if (guard) return

    yield put({ type: APPLY_FILTER, payload: {...data.payload} })
    yield put(buildLocation())
}

function* setGridSortOrderSaga(data) {
    const guard = yield select(refreshGuardSelector)

    if (guard) return

    const _sort: GridSortOrder = data.payload,
        _value = _sort.direction === GRID_SORT_DIRECTION.ACS ? _sort.field : `${_sort.field},${_sort.direction}`

    yield put({type: SET_GRID_SORT_ORDER, payload: _value})
    yield put(buildLocation())
}

function* setActiveTaskIdSaga(data) {
    const guard = yield select(refreshGuardSelector)

    if (guard) return

    yield put({type: SET_ACTIVE_TASK_ID, payload: data.payload})
    yield put(buildLocation())
    yield put({type: CLEAR_GUARD})
}

function* buildLocationSaga() {
    const path = yield select(pathSelector),
        params = yield select(paramsSelector)

    yield put({type: BUILD_LOCATION})
    let newLocation = path + (params ? `?${params}` : "")

    console.log('params new loc', params)
    yield put(push(newLocation))
}

function* setInitStateSaga({payload}) {

    console.log('setInitStateSaga', payload)

    if (payload.pathname) {
        yield put({type: SET_PATHNAME, payload: payload.pathname})
    }

    if (payload.filter) {
        yield put({ type: APPLY_FILTER, payload: {...payload.filter} })
    }

    if (payload.activeTask) {
        yield put({type: SET_ACTIVE_TASK_ID, payload: payload.activeTask})
    }

    if (payload.order) {
        const _sort: GridSortOrder = payload.order,
            _value = _sort.direction === GRID_SORT_DIRECTION.ACS ? _sort.field : `${_sort.field},${_sort.direction}`

        yield put({type: SET_GRID_SORT_ORDER, payload: _value})
    }

    if (payload.replacePath) {
        yield put(buildLocation(true))
    }
}
