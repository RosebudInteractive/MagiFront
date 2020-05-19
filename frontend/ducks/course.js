import {appName} from '../config'
import {all, call, put, takeEvery, select} from "@redux-saga/core/effects";
import {
    GET_SINGLE_COURSE_FAIL,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    SET_COURSE_NOT_FOUND
} from "../constants/courses";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {Record, List} from "immutable";
import {createSelector} from "reselect";


/**
 * Constants
 * */
export const moduleName = 'course'
const prefix = `${appName}/${moduleName}`

const GET_COURSE_DISCOUNTS_REQUEST = `${prefix}/GET_COURSE_DISCOUNTS_REQUEST`
const GET_COURSE_DISCOUNTS_START = `${prefix}/GET_COURSE_DISCOUNTS_START`
const GET_COURSE_DISCOUNTS_SUCCESS = `${prefix}/GET_COURSE_DISCOUNTS_SUCCESS`
const GET_COURSE_DISCOUNTS_FAIL = `${prefix}/GET_COURSE_DISCOUNTS_FAIL`


const GET_CONCRETE_COURSE_REQUEST = `${prefix}/GET_CONCRETE_COURSE_REQUEST`


const ReducerRecord = Record({
    loading: false,
    loaded: false,
    discounts: new List(),
    lastSuccessTime: null,
    notFound: false,
})

const Discount = Record({
    value: null,
    descr: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_COURSE_DISCOUNTS_START:
            return state.set("loading", true)

        case GET_COURSE_DISCOUNTS_SUCCESS:
            return state
                .set("loading", false)
                .set("discounts", arrayToList(payload, Discount))

        case GET_COURSE_DISCOUNTS_FAIL:
            return state.set("loading", false)

        default:
            return state
    }
}

const arrayToList = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.push(new DataRecord(value)),
        new List([])
    )
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const discountSelector = createSelector(stateSelector, state => state.discounts)

/**
 * Action Creators
 * */
export const getCourseDiscounts = () => {
    return { type: GET_COURSE_DISCOUNTS_REQUEST }
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_COURSE_DISCOUNTS_REQUEST, getCourseDiscountsSaga),
        takeEvery(GET_CONCRETE_COURSE_REQUEST, getCourseSaga),
    ])
}

function* getCourseDiscountsSaga() {
    try {
        yield put({type: GET_COURSE_DISCOUNTS_START})

        let _discounts = call(_fetchDiscounts)
        yield put({type: GET_COURSE_DISCOUNTS_SUCCESS, payload: _discounts})
    } catch (e) {
        yield put({type: GET_COURSE_DISCOUNTS_FAIL, payload: {e}})
    }
}

function _fetchDiscounts() {
    return fetch("/api/courses/discounts", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* getCourseSaga(data) {
    //
    //
    // console.log(data)
    //
    // yield put({type: GET_SINGLE_COURSE_REQUEST})
    //
    // try {
    //     const _course = yield call(_fetchCourse, data.payload),
    //         _state = yield select(state => state)
    //
    //     // handleCourse(_course, _state);
    //
    //     yield put({type: GET_SINGLE_COURSE_SUCCESS, payload: _course})
    // } catch (err) {
    //
    //     console.error(err)
    //
    //     if (err.status === 404) {
    //         yield put({type: SET_COURSE_NOT_FOUND})
    //     } else {
    //         yield put({type: GET_SINGLE_COURSE_FAIL, payload: err})
    //     }
    // }
}

function _fetchCourse(url, options) {
    const _fetchUrl = "/api/courses/" + url + (options && options.absPath ? "?abs_path=true" : "")

    return fetch(_fetchUrl, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            console.log(data)

            return data
        })
}