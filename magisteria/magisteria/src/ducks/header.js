import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, commonGetQuery, parseJSON} from "../tools/fetch-tools";
import {all, takeEvery, put, call, select, fork,} from 'redux-saga/effects'
import CourseDiscounts from "tools/course-discount";

/**
 * Constants
 * */
export const moduleName = 'header'
const prefix = `${appName}/${moduleName}`

const GET_DISCOUNTS_REQUEST = `${prefix}/GET_DISCOUNTS_REQUEST`
const GET_DISCOUNTS_START = `${prefix}/GET_DISCOUNTS_START`
const GET_DISCOUNTS_SUCCESS = `${prefix}/GET_DISCOUNTS_SUCCESS`
const GET_DISCOUNTS_FAIL = `${prefix}/GET_DISCOUNTS_FAIL`

const SHOW_DISCOUNT_MENU = `${prefix}/SHOW_DISCOUNT_MENU`
const HIDE_DISCOUNT_MENU = `${prefix}/HIDE_DISCOUNT_MENU`

const ResultRecord = Record({
    dynamic: [],
    other: []
})

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    result: new ResultRecord(),
    count: 0,
    active: false,
    showDiscountMenu: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        // case GET_DISCOUNTS_REQUEST:
        //     return state
        //         .set("result", new ResultRecord())
        //         .set("count", 0)

        case GET_DISCOUNTS_SUCCESS:
            return state
                .set("result", new ResultRecord({other: payload.Other ? payload.Other: [], dynamic: payload.Dynamic ? payload.Dynamic : []}))
                .set("count", payload.count)
                .set("active", payload.active)
                .set("fetching", false)

        case GET_DISCOUNTS_FAIL:
            return state
                .set("result", new ResultRecord())
                .set("count", 0)
                .set("active", false)
                .set("fetching", false)

        case SHOW_DISCOUNT_MENU:
            return state.set("showDiscountMenu", true)

        case HIDE_DISCOUNT_MENU:
            return state.set("showDiscountMenu", false)

        default:
            return state
    }
}

/**
 * Selectors
 * */
export const stateSelector = state => state[moduleName]
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const countSelector = createSelector(stateSelector, state => state.count)
export const resultSelector = createSelector(stateSelector, state => state.result)
export const activeSelector = createSelector(stateSelector, state => state.active)
export const showDiscountMenuSelector = createSelector(stateSelector, state => state.showDiscountMenu)

/**
 * Action Creators
 * */
export const getDiscounts = () => {
    return {type: GET_DISCOUNTS_REQUEST}
}

export const getDiscountsAndShow = () => {
    return {type: GET_DISCOUNTS_REQUEST, payload: {showMenu: true}}
}

export const hideDiscountMenu = () => {
    return {type: HIDE_DISCOUNT_MENU}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_DISCOUNTS_REQUEST, getDiscountsSaga)
    ])
}

function* getDiscountsSaga(data) {
    yield put({type: GET_DISCOUNTS_START})
    try {

        let _dynamicDiscounts = CourseDiscounts.getActiveDynamicDiscounts(),
            _params = _dynamicDiscounts && _dynamicDiscounts.length ?
                _dynamicDiscounts
                    .map((value) => {
                        return `${value.code}:${value.id}:${value.percent}`
                    })
                    .join(",")
                :
                null

        const _discounts = yield call(commonGetQuery, "/api/users/courses-for-sale" + (_params ? "?Codes=" + _params : "")),
            count = _discounts.Dynamic ? _discounts.Dynamic.length : 0,
            active = count || (_discounts.Other && _discounts.Other.length)

        yield put({type: GET_DISCOUNTS_SUCCESS, payload: {active, count, ..._discounts}})
        if (data.payload && data.payload.showMenu) {
            yield put({type: SHOW_DISCOUNT_MENU,})
        }
    } catch (error) {
        yield put({type: GET_DISCOUNTS_FAIL, payload: {error}})
    }
}

