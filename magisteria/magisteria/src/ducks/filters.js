import {appName} from '../config'
import {createSelector} from 'reselect'
import Immutable, {Record, Map, Set} from 'immutable'
import {all, put, takeEvery, select} from "@redux-saga/core/effects";
import {GET_COURSES_REQUEST, GET_COURSES_SUCCESS} from "../constants/courses";
import {FILTER_COURSE_TYPE,} from "../constants/filters";
import {FILTER_TYPE} from "../constants/common-consts";
import {replace} from "react-router-redux";

/**
 * Constants
 * */
export const moduleName = 'filters'
const prefix = `${appName}/${moduleName}`

const CLEAR_FILTERS = `${prefix}/CLEAR_FILTERS`
const SWITCH_FILTERS = `${prefix}/SWITCH_FILTERS`
const APPLY_EXTERNAL_FILTER = `${prefix}/APPLY_EXTERNAL_FILTER`
const SET_FILTER_COURSE_TYPE = `${prefix}/SET_FILTER_COURSE_TYPE`
const SET_ALL_COURSE_TYPE = `${prefix}/SET_ALL_COURSE_TYPE`
const TOGGLE_FILTER_COURSE_TYPE = `${prefix}/TOGGLE_FILTER_COURSE_TYPE`
const SET_INITIAL_STATE = `${prefix}/SET_INITIAL_STATE`
const SET_ROOT_STATE = `${prefix}/SET_ROOT_STATE`
const ENABLE_SCROLL_GUARD = `${prefix}/ENABLE_SCROLL_GUARD`
const DISABLE_SCROLL_GUARD = `${prefix}/DISABLE_SCROLL_GUARD`


/**
 * Reducer
 * */
const FilterRecord = Record({
    id: null,
    name: null,
    count: { theory: 0, practice: 0 },
    URL: null,
    selected: false,
})

export const ReducerRecord = Record({
    courseType: new Set([FILTER_COURSE_TYPE.THEORY, FILTER_COURSE_TYPE.PRACTICE]),
    mainType: FILTER_COURSE_TYPE.THEORY,
    filters: new Map(),
    root: new FilterRecord(),
    loading: false,
    scrollHandlerGuard: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_COURSES_REQUEST:
            return state
                .set('loading', true)
                .update('filters', filters => filters.clear())

        case GET_COURSES_SUCCESS: {
            let _map = _getFilters(payload)

            return state
                .update('filters', filters => filters.merge(_map))
                .set('root', _getRoot(payload))
                .set('loading', false)
        }

        case CLEAR_FILTERS:
            return state
                .update('filters', filters => {
                    return filters.map((item) => {
                        return item.set('selected', false)
                    });
                })
                .set('scrollHandlerGuard', true)

        case SWITCH_FILTERS:
            return state
                .update('filters', filters => {
                    return filters.map((item) => {
                        let _value = item.get('URL') === payload ? !item.get('selected') : false

                        return item.set('selected', _value)
                    });
                })
                .set('scrollHandlerGuard', true)

        case APPLY_EXTERNAL_FILTER: {
            if (payload) {
                let _map = state.get('filters');

                if (payload.value.toLocaleLowerCase() === "all") {
                    _map = _map.map((item) => {
                        return item.set('selected', false)
                    })
                } else {
                    _map = _map.map((item) => {
                        return item.set('selected', item.get("URL") === payload.value)
                    })
                }

                let _mainType, _courseType
                switch (payload.type) {
                    case FILTER_TYPE.RAZDEL:{
                        _mainType = FILTER_COURSE_TYPE.THEORY
                        _courseType = new Set([FILTER_COURSE_TYPE.THEORY, FILTER_COURSE_TYPE.PRACTICE])
                        break
                    }

                    case FILTER_TYPE.RAZDEL_REVERSE:{
                        _mainType = FILTER_COURSE_TYPE.PRACTICE
                        _courseType = new Set([FILTER_COURSE_TYPE.THEORY, FILTER_COURSE_TYPE.PRACTICE])
                        break
                    }

                    case FILTER_TYPE.KNOWLEDGE:{
                        _mainType = FILTER_COURSE_TYPE.THEORY
                        _courseType = new Set([FILTER_COURSE_TYPE.THEORY])
                        break
                    }

                    case FILTER_TYPE.KNOWHOW:{
                        _mainType = FILTER_COURSE_TYPE.PRACTICE
                        _courseType = new Set([FILTER_COURSE_TYPE.PRACTICE])
                        break
                    }

                    default:{
                        _mainType = FILTER_COURSE_TYPE.THEORY
                        _courseType = new Set([FILTER_COURSE_TYPE.THEORY])
                        break
                    }
                }

                return state
                    .set('filters', _map)
                    .set('mainType', _mainType)
                    .set('courseType', _courseType)
            } else {
                return state
            }

        }

        case SET_FILTER_COURSE_TYPE:
            return state
                .set('courseType', new Set([payload]))
                .set('mainType', payload)
                .set('scrollHandlerGuard', true)

        case TOGGLE_FILTER_COURSE_TYPE:
            return state
                .update('courseType', (courseType) => {
                    if (courseType.has(payload)) {
                        return courseType.delete(payload)
                    } else {
                        return courseType.add(payload)
                    }
                })
                .set('scrollHandlerGuard', true)

        case DISABLE_SCROLL_GUARD:
            return state
                .set('scrollHandlerGuard', false)

        case ENABLE_SCROLL_GUARD:
            return state
                .set('scrollHandlerGuard', true)

        case SET_ALL_COURSE_TYPE:
            return state
                .set('courseType', new Set([FILTER_COURSE_TYPE.THEORY, FILTER_COURSE_TYPE.PRACTICE]))

        default:
            return state
    }
}

const _getFilters = (data) => {

    let _obj = {}

    if (data.Categories) {
        data.Categories.map((item) => {
            let _value = {
                id: item.Id,
                name: item.Name,
                count: { theory: _parseCounter(item.CntByType["1"]), practice: _parseCounter(item.CntByType["2"]) },
                URL: item.URL,
                selected: false,
            }

            return _obj[item.URL]= _value
        })
    }

    return Immutable.fromJS(_obj)
}

const _getRoot = (data) => {
    let _root =  {
        id: 0,
        name: "?????? ????????",
        count: data.Categories.reduce((acc, item) => {
            return {theory : acc.theory + _parseCounter(item.CntByType["1"]), practice: acc.practice + _parseCounter(item.CntByType["2"])}
        }, {theory: 0, practice: 0}),
        URL: "/",
        selected: true,
    }

    return new FilterRecord(_root)
}

const _parseCounter = (value) => {
    return isNaN(+value) ? 0 : +value
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const rootSelector = createSelector(stateSelector, state => state.root)
export const filtersSelector = createSelector(stateSelector, state => state.filters)
export const filterCourseTypeSelector = createSelector(stateSelector, state => state.courseType)
export const filterMainTypeSelector = createSelector(stateSelector, state => state.mainType)
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const scrollGuardSelector = createSelector(stateSelector, state => state.scrollHandlerGuard)
export const isEmptyFilterSelector = createSelector(filtersSelector, filter => filter.every(item => !item.get('selected')))
export const selectedFilterSelector = createSelector(filtersSelector, filter => filter.filter(item => item.get('selected')))

/**
 * Action Creators
 * */

export const clear = () => {
    return {type: CLEAR_FILTERS}
};

export const switchFilter = (id) => {
    return {
        type: SWITCH_FILTERS,
        payload: id
    }
}

export const applyExternalFilter = (filterType, value) => {
    return {
        type: APPLY_EXTERNAL_FILTER,
        payload: {type: filterType, value: value}
    }
}

export const setFilterCourseType = (value) => {
    return { type: SET_FILTER_COURSE_TYPE, payload: value }
}

export const toggleCourseTypeToFilter = (value) => {
    return { type: TOGGLE_FILTER_COURSE_TYPE, payload: value }
}

export const setInitialState = () => {
    return { type: SET_INITIAL_STATE }
}

export const setRootState = () => {
    return { type: SET_ROOT_STATE }
}

export const disableScrollGuard = () => {
    return { type: DISABLE_SCROLL_GUARD}
}

export const enableScrollGuard = () => {
    return { type: ENABLE_SCROLL_GUARD}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery([SET_FILTER_COURSE_TYPE, TOGGLE_FILTER_COURSE_TYPE, APPLY_EXTERNAL_FILTER], switchFilterTypeSaga),
        takeEvery(SET_INITIAL_STATE, setInitialStateSaga),
        takeEvery(SET_ROOT_STATE, setInitialStateSaga),
    ])
}

function* switchFilterTypeSaga(data) {

    const filterCourseType = yield select(filterCourseTypeSelector),
        selectedFilter = yield select(selectedFilterSelector),
        isEmptyFilter = yield select(isEmptyFilterSelector)

    let _count = 0

    selectedFilter.forEach((item) => {
        for (let type in FILTER_COURSE_TYPE) {
            _count = filterCourseType.has(FILTER_COURSE_TYPE[type]) ? _count + item.getIn(['count', type.toLowerCase()]) : _count
        }
    })

    if (!isEmptyFilter && (_count === 0)) {
        yield put(clear())
    }
}

function* setInitialStateSaga() {
    yield put(clear())
    yield put(setFilterCourseType(FILTER_COURSE_TYPE.THEORY))
    yield put({type: SET_ALL_COURSE_TYPE})
    yield put(replace("/"))
}