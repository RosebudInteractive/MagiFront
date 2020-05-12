import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, getErrorMessage, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, put, call, select, race, take} from 'redux-saga/effects'
import {confirmCloseEditorSaga, queryUserConfirmationSaga} from "adm-ducks/messages";
import {GET_COURSES_FAIL, GET_COURSES_SUCCESS, getCourses} from "adm-ducks/course";
import {isDirty, reset, change,} from "redux-form";
import $ from "jquery";


/**
 * Constants
 * */
export const moduleName = "reviews"
const prefix = `${appName}/${moduleName}`

const GET_REVIEWS_REQUEST = `${prefix}/GET_REVIEWS_REQUEST`
const GET_REVIEWS_START = `${prefix}/GET_REVIEWS_START`
const GET_REVIEWS_SUCCESS = `${prefix}/GET_REVIEWS_SUCCESS`
const GET_REVIEWS_FAIL = `${prefix}/GET_REVIEWS_FAIL`

const CREATE_NEW_REVIEW_REQUEST = `${prefix}/CREATE_NEW_REVIEW_REQUEST`
const CREATE_NEW_REVIEW_START = `${prefix}/CREATE_NEW_REVIEW_START`

const EDIT_REVIEW_REQUEST = `${prefix}/EDIT_REVIEW_REQUEST`
const EDIT_REVIEW_START = `${prefix}/EDIT_REVIEW_START`

const INSERT_REVIEW_REQUEST = `${prefix}/INSERT_REVIEW_REQUEST`
const INSERT_REVIEW_START = `${prefix}/INSERT_REVIEW_START`
const INSERT_REVIEW_SUCCESS = `${prefix}/INSERT_REVIEW_SUCCESS`
const INSERT_REVIEW_FAIL = `${prefix}/INSERT_REVIEW_FAIL`

const UPDATE_REVIEW_REQUEST = `${prefix}/UPDATE_REVIEW_REQUEST`
const UPDATE_REVIEW_START = `${prefix}/UPDATE_REVIEW_START`
const UPDATE_REVIEW_SUCCESS = `${prefix}/UPDATE_REVIEW_SUCCESS`
const UPDATE_REVIEW_FAIL = `${prefix}/UPDATE_REVIEW_FAIL`

const DELETE_REVIEW_REQUEST = `${prefix}/DELETE_REVIEW_REQUEST`
const DELETE_REVIEW_START = `${prefix}/DELETE_REVIEW_START`
const DELETE_REVIEW_SUCCESS = `${prefix}/DELETE_REVIEW_SUCCESS`
const DELETE_REVIEW_FAIL = `${prefix}/DELETE_REVIEW_FAIL`

const SHOW_EDITOR = `${prefix}/SHOW_EDITOR`
const CLOSE_EDITOR_REQUEST = `${prefix}/CLOSE_EDITOR_REQUEST`
const CLOSE_EDITOR = `${prefix}/CLOSE_EDITOR`

const CHECK_USER_EMAIL_REQUEST = `${prefix}/CHECK_USER_EMAIL_REQUEST`
const CHECK_USER_EMAIL_START = `${prefix}/CHECK_USER_EMAIL_START`
const CHECK_USER_EMAIL_SUCCESS = `${prefix}/CHECK_USER_EMAIL_SUCCESS`
const CHECK_USER_EMAIL_FAIL = `${prefix}/CHECK_USER_EMAIL_FAIL`

const CLEAR_CHECK_USER_ERROR = `${prefix}/CLEAR_CHECK_USER_ERROR`
const SET_REVIEW_USER_EMAIL = `${prefix}/SET_REVIEW_USER_EMAIL`

const RAISE_ERROR_REQUEST = `${prefix}/RAISE_ERROR_REQUEST`

const NOT_EXIST_REVIEW_ERROR = "Запрошенного отзыва не существует"
const USER_NOT_FOUND = "Указанный пользователь не найден"

/**
 * Reducer
 * */
const ReducerRecord = Record({
    loading: false,
    loaded: false,
    showEditor: false,
    editMode: true,
    selected: null,
    entries: new OrderedMap([]),
    checkUserError: false,
    userErrorMessage: null,
})

const ReviewRecord = Record({
    Id: null,
    Title: null,
    CourseId: null,
    Status: null,
    ReviewDate: null,
    UserId: null,
    UserEmail: null,
    UserName: null,
    ProfileUrl: null,
    Review: null,
    ReviewPub: null,
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
                .set('entries', dataToEntries(payload, ReviewRecord))

        case GET_REVIEWS_FAIL:
            return state
                .set('loaded', false)
                .set('loading', false)

        case CREATE_NEW_REVIEW_START:
            return state.set('editMode', false)

        case EDIT_REVIEW_START:
            return state
                .set('selected', payload)
                .set('editMode', true)

        case DELETE_REVIEW_SUCCESS:
            return state
                .update('entries', entries => entries.delete(payload))
                .set('loading', false)

        case SHOW_EDITOR:
            return state.set('showEditor', true)

        case CLOSE_EDITOR:
            return state
                .set('showEditor', false)
                .set('checkUserError', false)
                .set('userErrorMessage', null)

        case INSERT_REVIEW_START:
        case UPDATE_REVIEW_START:
        case DELETE_REVIEW_START:
            return state.set('loading', true)

        case INSERT_REVIEW_SUCCESS:
        case UPDATE_REVIEW_SUCCESS:
        case INSERT_REVIEW_FAIL:
        case UPDATE_REVIEW_FAIL:
        case DELETE_REVIEW_FAIL:
            return state.set('loading', false)

        case SET_REVIEW_USER_EMAIL:
            return state.setIn(['entries', payload.reviewId, 'UserEmail'], payload.user)

        case CHECK_USER_EMAIL_FAIL:
            return state
                .set('checkUserError', true)
                .set('userErrorMessage', payload)


        case CLEAR_CHECK_USER_ERROR:
            return state
                .set('checkUserError', false)
                .set('userErrorMessage', null)

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
export const showEditorSelector = createSelector(stateSelector, state => state.showEditor)
export const editModeSelector = createSelector(stateSelector, state => state.editMode)
export const selectedIdSelector = createSelector(stateSelector, state => state.selected)
export const checkUserErrorSelector = createSelector(stateSelector, state => state.checkUserError)
export const userErrorMessageSelector = createSelector(stateSelector, state => state.userErrorMessage)

/**
 * Action Creators
 * */
export const getReviews = (params) => {
    return {type: GET_REVIEWS_REQUEST, payload: params}
}

export const checkUser = (data) => {
    return {type: CHECK_USER_EMAIL_REQUEST, payload: data}
}

export const clearCheckUserError = () => {
    return {type: CLEAR_CHECK_USER_ERROR}
}

export const createNewReview = (params) => {
    return {type: CREATE_NEW_REVIEW_REQUEST, payload: params}
}

export const editReview = (reviewId) => {
    return {type: EDIT_REVIEW_REQUEST, payload: {reviewId: reviewId}}
}

export const insertReview = (data) => {
    return {type: INSERT_REVIEW_REQUEST, payload: data}
}

export const updateReview = (data) => {
    return {type: UPDATE_REVIEW_REQUEST, payload: data}
}

export const deleteReview = (reviewId) => {
    return {type: DELETE_REVIEW_REQUEST, payload: reviewId}
}

export const closeEditor = () => {
    return {type: CLOSE_EDITOR_REQUEST}
}

export const raiseNotExistReviewError = () => {
    return {type: RAISE_ERROR_REQUEST}
}

/**
 * Sagas
 */
function* getReviewsSaga(data) {
    yield put({type: GET_REVIEWS_START})

    try {
        const [_reviews] = yield all([
            call(_fetchReviews, data.payload),
            put(getCourses()),
        ])

        const {success} = yield race({
            success: take(GET_COURSES_SUCCESS),
            fail: take(GET_COURSES_FAIL)
        })

        if (success) {
            yield put({type: GET_REVIEWS_SUCCESS, payload: _reviews})
        } else {
            yield put({ type: GET_REVIEWS_FAIL, payload: null })
        }
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

const _fetchReviews = (params) => {
    // const _url = '/api/reviews' + (courseId ? `?course_id=${courseId}` : "")
    const _url = '/api/reviews'

    return fetch(_url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* createReviewSaga(data) {
    yield put(replace(`/adm/reviews/new`))

    yield put({type: CREATE_NEW_REVIEW_START})
    yield put({type: SHOW_EDITOR})
}

function* editReviewRequestSaga(action) {
    const _editorOpened = yield select(showEditorSelector)

    if (_editorOpened) {
        const _hasChanges = yield select(isDirty('ReviewEditor'))

        if (_hasChanges) {
            const _confirmed = yield call(confirmCloseEditorSaga);

            if (_confirmed) {
                yield call(editReviewSaga, action.payload)
            }
        } else {
            yield call(editReviewSaga, action.payload)
        }
    } else {
        yield call(editReviewSaga, action.payload)
    }
}

function* editReviewSaga(data) {
    const {reviewId,} = data,
        _loaded = yield select(loadedSelector)

    let _needLoadUserInfo = false

    if (!_loaded) {
        const {success} = yield race({
            success: take(GET_REVIEWS_SUCCESS),
            fail: take(GET_REVIEWS_FAIL)
        })

        _needLoadUserInfo = !!success
    } else {
        _needLoadUserInfo = true
    }

    const _reviews = yield select(entriesSelector),
        _selectedReview = _reviews.get(reviewId)

    if (_needLoadUserInfo && _selectedReview && !_selectedReview.UserEmail) {
        const _userInfo = yield _getUserInfo({id: _selectedReview.UserId})

        if (_userInfo && _userInfo.Email) {
            yield put({type: SET_REVIEW_USER_EMAIL, payload: {reviewId: reviewId, user: _userInfo.Email}})
        }
    }


    yield put(replace(`/adm/reviews/edit/${reviewId}`))

    yield put({type: EDIT_REVIEW_START, payload: reviewId})
    yield put({type: SHOW_EDITOR})
}

function* insertReviewSaga(action) {
    yield put({type: INSERT_REVIEW_START})

    try {
        let _data = {...action.payload}

        let _payload = {
            Title: _data.title,
            CourseId: _data.courseId,
            Status: _data.status,
            ReviewDate: _data.reviewDate,
            UserId: _data.userId,
            UserName: _data.userName,
            ProfileUrl: _data.profileUrl,
            Review: _data.review,
            ReviewPub: _data.reviewPub,
        }

        const _newData = yield call(_postReview, _payload)

        yield put({type: INSERT_REVIEW_SUCCESS, payload: _newData})

        yield put(reset('ReviewEditor'))
        yield put(getReviews())
        yield put({type: CLOSE_EDITOR})
    } catch (error) {
        yield put({ type: INSERT_REVIEW_FAIL })

        yield put({
            type: SHOW_ERROR_DIALOG,
            payload: error.message
        })
    }
}

const _postReview = (data) => {
    return fetch("/api/adm/reviews", {
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

function* updateReviewSaga(action) {
    yield put({type: UPDATE_REVIEW_START})

    try {
        let _data = {...action.payload}

        let _payload = {
            Id: _data.Id,
            Title: _data.title,
            CourseId: _data.courseId,
            Status: _data.status,
            ReviewDate: _data.reviewDate,
            UserId: _data.userId,
            UserName: _data.userName,
            ProfileUrl: _data.profileUrl,
            Review: _data.review,
            ReviewPub: _data.reviewPub,
        }

        const _newData = yield call(_putPromo, _payload)

        yield put({type: UPDATE_REVIEW_SUCCESS, payload: _newData})

        yield put(reset('ReviewEditor'))
        yield put(getReviews())
        yield put({type: CLOSE_EDITOR_REQUEST})
    } catch (error) {
        yield put({ type: UPDATE_REVIEW_FAIL })

        yield put({
            type: SHOW_ERROR_DIALOG,
            payload: error.message
        })
    }
}

const _putPromo = (data) => {
    return fetch("/api/adm/reviews/" + data.Id, {
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

function* closeEditorSaga() {
    yield put(replace('/adm/reviews'))
    yield put({type: CLOSE_EDITOR})
}

function* raiseNotExistBookErrorSaga() {
    yield call(closeEditorSaga)
    yield put({type: SHOW_ERROR_DIALOG, payload: NOT_EXIST_REVIEW_ERROR})
}

function* checkUserSaga(data) {
    yield put({type: CHECK_USER_EMAIL_START})
    try {
        let _options = data.payload,
            _user = {}

        if (_options.id) { _user.id = _options.id }
        if (_options.email) { _user.email = _options.email }

        const _userInfo = yield _getUserInfo(_user)

        if (_userInfo && _userInfo.Id) {
            yield put({type: CHECK_USER_EMAIL_SUCCESS, payload: _userInfo})
            yield put(change('ReviewEditor', 'userId', _userInfo.Id))

            console.log(_userInfo)

            if (_options.needUpdateUserName) {
                yield put(change('ReviewEditor', 'userName', _userInfo.DisplayName))
            }
        } else {
            yield put({type: CHECK_USER_EMAIL_FAIL, payload: USER_NOT_FOUND})
        }
    } catch (error) {
        switch (+error.status) {
            case 404 : {
                yield put({type: CHECK_USER_EMAIL_FAIL, payload: USER_NOT_FOUND})
                return 
            }

            default: {
                const _message = yield call(getErrorMessage, error)
                yield put({type: CHECK_USER_EMAIL_FAIL, payload: _message})
            }
        }
    }

}

const _getUserInfo = (user) => {
    const _params = $.param(user)

    const _url = '/api/adm/users/info' + (_params ? `?${_params}` : "")

    return fetch(_url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

export const saga = function* () {
    yield all([
        takeEvery(GET_REVIEWS_REQUEST, getReviewsSaga),
        takeEvery(CREATE_NEW_REVIEW_REQUEST, createReviewSaga),
        takeEvery(INSERT_REVIEW_REQUEST, insertReviewSaga),
        takeEvery(EDIT_REVIEW_REQUEST, editReviewRequestSaga),
        takeEvery(UPDATE_REVIEW_REQUEST, updateReviewSaga),
        takeEvery(DELETE_REVIEW_REQUEST, deleteReviewSaga),
        takeEvery(RAISE_ERROR_REQUEST, raiseNotExistBookErrorSaga),
        takeEvery(CLOSE_EDITOR_REQUEST, closeEditorSaga),
        takeEvery(CHECK_USER_EMAIL_REQUEST, checkUserSaga),
    ])
}


const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new OrderedMap({})
    )
}