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

const ResultRecord = Record({
    other: []
})

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    result: new ResultRecord(),
    count: 0,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_DISCOUNTS_REQUEST:
            return state
                .set("result", [])
                .set("count", 0)

        case GET_DISCOUNTS_SUCCESS:
            return state
                .set("result", {other: payload.Other})
                .set("count", payload.Other.length)
                .set("fetching", false)

        case GET_DISCOUNTS_FAIL:
            return state
                .set("result", [])
                .set("fetching", false)

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

/**
 * Action Creators
 * */
export const getDiscounts = () => {
    return {type: GET_DISCOUNTS_REQUEST}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_DISCOUNTS_REQUEST, getDiscountsSaga)
    ])
}

function* getDiscountsSaga() {
    yield put({type: GET_DISCOUNTS_START})
    try {

        let _dynamicDiscounts = CourseDiscounts.getActiveDynamicDiscounts(),
            _params = _dynamicDiscounts && _dynamicDiscounts.length ?
                _dynamicDiscounts
                    .map((value) => {
                        return `${value.code}:${value.percent}:${value.price}`
                    })
                    .join(",")
                :
                null

        const _discounts = yield call(commonGetQuery, "/api/users/courses-for-sale" + (_params ? "?Codes=" + _params : ""))

        yield put({type: GET_DISCOUNTS_SUCCESS, payload: _discounts})
    } catch (error) {
        yield put({type: GET_DISCOUNTS_FAIL, payload: {error}})
    }
}

