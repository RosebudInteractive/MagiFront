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
import equal from 'fast-deep-equal'

/**
 * Constants
 * */
export const moduleName = 'route'
const prefix = `${appName}/${moduleName}`

const SET_PATHNAME_REQUEST = `${prefix}/SET_PATHNAME_REQUEST`
const SET_PATHNAME = `${prefix}/SET_PATHNAME`

const APPLY_FILTER_REQUEST = `${prefix}/APPLY_FILTER_REQUEST`
const APPLY_FILTER = `${prefix}/APPLY_FILTER`
const CLEAR_FILTER = `${prefix}/CLEAR_FILTER`

const SET_GRID_SORT_ORDER_REQUEST = `${prefix}/SET_GRID_SORT_ORDER_REQUEST`
const SET_GRID_SORT_ORDER = `${prefix}/SET_GRID_SORT_ORDER`
const CLEAR_GRID_SORT_ORDER = `${prefix}/CLEAR_GRID_SORT_ORDER`

const SET_ACTIVE_TASK_ID_REQUEST = `${prefix}/SET_ACTIVE_TASK_ID_REQUEST`
const SET_ACTIVE_TASK_ID = `${prefix}/SET_ACTIVE_TASK_ID`

const SET_DASHBOARD_VIEW_MODE_REQUEST = `${prefix}/SET_DASHBOARD_VIEW_MODE_REQUEST`
const SET_DASHBOARD_VIEW_MODE = `${prefix}/SET_DASHBOARD_VIEW_MODE`
const SET_DASHBOARD_ACTIVE_RECORD = `${prefix}/SET_DASHBOARD_ACTIVE_RECORD`

const BUILD_LOCATION_REQUEST = `${prefix}/BUILD_LOCATION_REQUEST`
const BUILD_LOCATION = `${prefix}/BUILD_LOCATION`
const CLEAR_GUARD = `${prefix}/CLEAR_GUARD`

const SET_INIT_STATE_REQUEST = `${prefix}/SET_INIT_STATE_REQUEST`
const SET_DASHBOARD_ACTIVE_RECORD_REQUEST = `${prefix}/SET_DASHBOARD_ACTIVE_RECORD_REQUEST`


/**
 * Reducer
 * */
export const ReducerRecord = Record({
    path: "",
    order: "",
    filter: {},
    refreshGuard: false,
    custom: {}

})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {

        case SET_PATHNAME:
            return state
                .set("path", payload)
                .set("custom", {})

        case SET_GRID_SORT_ORDER:
            return state
                .set("order", payload);

        case CLEAR_GRID_SORT_ORDER:
            return state
                .set("order", '');

        case SET_ACTIVE_TASK_ID:
            return state
                .update('custom', (custom) => {
                    if (payload) {
                        return {...custom, activeTask: payload}
                    } else {
                        if (custom.activeTask) {
                            const result = {...custom};
                            delete result['activeTask'];
                            return result
                        } else {
                            return custom
                        }
                    }
                });

        case SET_DASHBOARD_VIEW_MODE:
            return state
                .update('custom', (custom) => {
                    if (payload) {
                        return {...custom, viewMode: payload}
                    } else {
                        if (custom.viewMode) {
                            const result = {...custom};
                            delete result['viewMode'];
                            return result
                        } else {
                            return custom
                        }
                    }
                });
        case SET_DASHBOARD_ACTIVE_RECORD:
            return state
                .update('custom', (custom) => {
                    if (payload) {
                        return {...custom, activeRecord: payload}
                    } else {
                        if (custom.activeRecord) {
                            const result = {...custom};
                            delete result['activeRecord'];
                            return result
                        } else {
                            return custom
                        }
                    }
                });

        case APPLY_FILTER:
            return state
                .set("filter", payload);

        case CLEAR_FILTER:
            return state
                .set("filter", {});

        case BUILD_LOCATION:
            return state
                .set("refreshGuard", false);

        case GET_TASKS_SUCCESS:
        case GET_TASKS_FAIL:
        case GET_PROCESSES_SUCCESS:
        case GET_PROCESSES_FAIL:
        case CLEAR_GUARD:
            return state
                .set("refreshGuard", false);

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
const customSelector = createSelector(stateSelector, state => state.custom)
export const activeTaskIdSelector = createSelector(customSelector, custom => custom.activeTask)
export const dashboardActiveRecordSelector = createSelector(customSelector, custom => custom.activeRecord)
export const paramsSelector = createSelector(stateSelector, (state) => {
    const params = {...state.filter},
        order = state.order;

    if (order) {
        params.order = order
    }

    return $.param({...params, ...state.custom});
});
const orderSelector = createSelector(stateSelector, state => state.order);
export const filterSelector = createSelector(stateSelector, state => state.filter);


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

export const setDashboardViewMode = (viewMode: number) => {
    return {type: SET_DASHBOARD_VIEW_MODE_REQUEST, payload: viewMode}
}

export const setDashboardActiveRecord = (recordId: number) => {
    return {type: SET_DASHBOARD_ACTIVE_RECORD_REQUEST, payload: recordId}
}

export const buildLocation = (replace: boolean = false) => {
    return {type: BUILD_LOCATION_REQUEST, payload: replace}
}

export const setInitState = (data) => {
    return {type: SET_INIT_STATE_REQUEST, payload: data}
}

export const clearLocationGuard = () => {
    return {type: CLEAR_GUARD}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(SET_PATHNAME_REQUEST, setPathnameSaga),
        takeEvery(APPLY_FILTER_REQUEST, applyFilterSaga),
        takeEvery(SET_GRID_SORT_ORDER_REQUEST, setGridSortOrderSaga),
        takeEvery(SET_ACTIVE_TASK_ID_REQUEST, setActiveTaskIdSaga),
        takeEvery(SET_DASHBOARD_VIEW_MODE_REQUEST, setDashboardViewModeSaga),
        takeEvery(SET_DASHBOARD_ACTIVE_RECORD_REQUEST, setDashboardActiveRecordSaga),
        takeEvery(BUILD_LOCATION_REQUEST, buildLocationSaga),
        takeEvery(SET_INIT_STATE_REQUEST, setInitStateSaga),
    ])
};

function* setPathnameSaga(data) {
    const currentPath = yield select(pathSelector)

    if (data.payload !== currentPath) {
        yield put({type: SET_PATHNAME, payload: data.payload})
    }
}

function* applyFilterSaga(data) {
    const guard = yield select(refreshGuardSelector)

    if (guard) return

    yield put({type: APPLY_FILTER, payload: {...data.payload}})
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

function* setDashboardActiveRecordSaga(data) {
    const guard = yield select(refreshGuardSelector)

    if (guard) return

    yield put({type: SET_DASHBOARD_ACTIVE_RECORD, payload: data.payload})
    yield put(buildLocation())
    yield put({type: CLEAR_GUARD})
}

function* setDashboardViewModeSaga(data) {
    const guard = yield select(refreshGuardSelector)

    if (guard) return

    yield put({type: SET_DASHBOARD_VIEW_MODE, payload: data.payload})
    yield put(buildLocation())
    yield put({type: CLEAR_GUARD})
}

function* buildLocationSaga() {
    const path = yield select(pathSelector),
        params = yield select(paramsSelector)

    yield put({type: BUILD_LOCATION})
    let newLocation = path + (params ? `?${params}` : "")

    yield put(push(newLocation))
}

function* setInitStateSaga({payload}) {
    if (payload.pathname) {
        yield put({type: SET_PATHNAME, payload: payload.pathname})
    }

    if (payload.filter) {
        const currentFilter = yield select(filterSelector)
        if (!equal(currentFilter, payload.filter)) {
            yield put({type: APPLY_FILTER, payload: {...payload.filter}})
        }
    } else {
        yield put({type: CLEAR_FILTER})
    }


    if (payload.activeTask) {
        yield put({type: SET_ACTIVE_TASK_ID, payload: payload.activeTask})
    }

    if (payload.viewMode) {
        yield put({type: SET_DASHBOARD_VIEW_MODE, payload: payload.viewMode})
    }

    if (payload.activeRecord) {
        yield put({type: SET_DASHBOARD_ACTIVE_RECORD, payload: payload.activeRecord})
    }

    if (payload.order) {
        const currentOrder = yield select(orderSelector);

        const sort: GridSortOrder = payload.order,
            value = sort.direction === GRID_SORT_DIRECTION.ACS ? sort.field : `${sort.field},${sort.direction}`

        if (currentOrder !== value) {
            yield put({type: SET_GRID_SORT_ORDER, payload: value})
        }
    } else {
        yield put({type: CLEAR_GRID_SORT_ORDER})
    }

    if (payload.replacePath) {
        yield put(buildLocation(true))
    }
}
