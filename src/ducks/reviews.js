import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, getErrorMessage, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, put, call, select} from 'redux-saga/effects'
import {queryUserConfirmationSaga} from "adm-ducks/messages";

/**
 * Constants
 * */
export const moduleName = "reviews"
const prefix = `${appName}/${moduleName}`

export const GET_REVIEWS_REQUEST = `${prefix}/GET_REVIEWS_REQUEST`
export const GET_REVIEWS_START = `${prefix}/GET_REVIEWS_START`
export const GET_REVIEWS_SUCCESS = `${prefix}/GET_REVIEWS_SUCCESS`
export const GET_REVIEWS_FAIL = `${prefix}/GET_REVIEWS_FAIL`

export const CREATE_NEW_REVIEW_REQUEST = `${prefix}/CREATE_NEW_REVIEW_REQUEST`
export const EDIT_REVIEW_REQUEST = `${prefix}/EDIT_REVIEW_REQUEST`

export const DELETE_REVIEW_REQUEST = `${prefix}/DELETE_REVIEW_REQUEST`
export const DELETE_REVIEW_START = `${prefix}/DELETE_REVIEW_START`
export const DELETE_REVIEW_SUCCESS = `${prefix}/DELETE_REVIEW_SUCCESS`
export const DELETE_REVIEW_FAIL = `${prefix}/DELETE_REVIEW_FAIL`

/**
 * Reducer
 * */
const ReducerRecord = Record({
    loading: false,
    loaded: false,
    selected: null,
    entries: new OrderedMap([])
})

const TestRecord = Record({
    Id: null,
    Name: null,
    TypeName: null,
    LessonId: null,
    Status: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_REVIEWS_START:
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_REVIEWS_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, TestRecord))

        case GET_REVIEWS_FAIL:
            return state
                .set('loaded', false)
                .set('loading', false)

        case DELETE_REVIEW_SUCCESS:
            return state
                .update('entries', entries => entries.delete(payload))

        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)

const entriesSelector = createSelector(stateSelector, state => state.entries)
export const reviewsSelector = createSelector(entriesSelector, (entries) => {
    let _array = entries.toArray();

    return _array.map((item, index) => {
        let _item = item.toObject()

        _item.id = _item.Id
        _item.Number = index + 1

        return _item
    })
})

/**
 * Action Creators
 * */
export const getReviews = (params) => {
    return {type: GET_REVIEWS_REQUEST, payload: params}
}

export const createNewReview = (params) => {
    return {type: CREATE_NEW_REVIEW_REQUEST, payload: params}
}

export const editReview = (reviewId) => {
    return {type: EDIT_REVIEW_REQUEST, payload: {reviewId: reviewId}}
}

export const deleteReview = (reviewId) => {
    return {type: DELETE_REVIEW_REQUEST, payload: reviewId}
}


/**
 * Sagas
 */
function* getReviewsSaga(data) {
    yield put({type: GET_REVIEWS_START})

    try {
        const _tests = yield call(_fetchReviews, data.payload)

        yield put({type: GET_REVIEWS_SUCCESS, payload: _tests})
    } catch (e) {
        yield put({ type: GET_REVIEWS_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _fetchReviews = (courseId) => {
    const _url = '/api/adm/tests/list' + (courseId ? `?course_id=${courseId}` : "")

    return fetch(_url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* createReviewSaga(data) {
    yield put(replace(`/adm/reviews/new`))
}

function* editReviewSaga(data) {
    const {reviewId,} = data.payload
    yield put(replace(`/adm/reviews/edit/${reviewId}`))
}

function* deleteReviewSaga(data) {

    const _confirmed = yield queryUserConfirmationSaga(`Удалить отзыв "${data.payload.Name}"?`)

    if (_confirmed) {
        yield put({type: DELETE_REVIEW_START})

        try {
            yield call(_deleteReview, data.payload.Id)
            yield put({type: DELETE_REVIEW_SUCCESS, payload: data.payload.Id})
        } catch (error) {
            yield put({type: DELETE_REVIEW_FAIL})

            const _message = yield call(getErrorMessage, error)
            yield put({type: SHOW_ERROR_DIALOG, payload: _message})
        }
    }
}

const _deleteReview = (id) => {
    return fetch(`/api/adm/tests/${id}`,
        {
            method: "DELETE",
            credentials: 'include'
        })
        .then(checkStatus)
        .then(parseJSON)
}

export const saga = function* () {
    yield all([
        takeEvery(GET_REVIEWS_REQUEST, getReviewsSaga),
        takeEvery(CREATE_NEW_REVIEW_REQUEST, createReviewSaga),
        takeEvery(EDIT_REVIEW_REQUEST, editReviewSaga),
        takeEvery(DELETE_REVIEW_REQUEST, deleteReviewSaga),
    ])
}


const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new OrderedMap({})
    )
}