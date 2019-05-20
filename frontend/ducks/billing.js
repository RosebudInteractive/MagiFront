import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import $ from 'jquery'
import {all, takeEvery, select, take, put, apply, call, fork} from 'redux-saga/effects'
import {SHOW_MODAL_MESSAGE_ERROR} from "ducks/message";
import {
    billingParamsSelector,
    RELOAD_CURRENT_PAGE_REQUEST,
    SHOW_WAITING_FORM,
    HIDE_WAITING_FORM,
} from "ducks/app";
import {FINISH_LOAD_PROFILE, GET_TRANSACTIONS_REQUEST, userPaidCoursesSelector} from "ducks/profile";
import {SHOW_SIGN_IN_FORM,} from "../constants/user";

/**
 * Constants
 * */
export const moduleName = 'billing'
const prefix = `${appName}/${moduleName}`

export const SHOW_BILLING_WINDOW = `${prefix}/SHOW_BILLING_WINDOW`
export const HIDE_BILLING_WINDOW = `${prefix}/HIDE_BILLING_WINDOW`
export const SHOW_COURSE_PAYMENT_WINDOW = `${prefix}/SHOW_COURSE_PAYMENT_WINDOW`
export const HIDE_COURSE_PAYMENT_WINDOW = `${prefix}/HIDE_COURSE_PAYMENT_WINDOW`

export const SWITCH_TO_PAYMENT = `${prefix}/SWITCH_TO_PAYMENT`
export const SWITCH_TO_SUBSCRIPTION = `${prefix}/SWITCH_TO_SUBSCRIPTION`

export const GET_SUBSCRIPTION_TYPES_REQUEST = `${prefix}/GET_SUBSCRIPTION_TYPES_REQUEST`
export const GET_SUBSCRIPTION_TYPES_START = `${prefix}/GET_SUBSCRIPTION_TYPES_START`
export const GET_SUBSCRIPTION_TYPES_SUCCESS = `${prefix}/GET_SUBSCRIPTION_TYPES_SUCCESS`
export const GET_SUBSCRIPTION_TYPES_ERROR = `${prefix}/GET_SUBSCRIPTION_TYPES_ERROR`

export const SET_SUBSCRIPTION_TYPE = `${prefix}/SET_SUBSCRIPTION_TYPE`

export const SEND_PAYMENT_REQUEST = `${prefix}/SEND_PAYMENT_REQUEST`
export const SEND_PAYMENT_START = `${prefix}/SEND_PAYMENT_START`
export const SEND_PAYMENT_SUCCESS = `${prefix}/SEND_PAYMENT_SUCCESS`
export const SEND_PAYMENT_ERROR = `${prefix}/SEND_PAYMENT_ERROR`

export const REDIRECT_COMPLETE = `${prefix}/REDIRECT_COMPLETE`

export const GET_PAID_COURSE_INFO_REQUEST = `${prefix}/GET_PAID_COURSE_INFO_REQUEST`
export const GET_PAID_COURSE_INFO_START = `${prefix}/GET_PAID_COURSE_INFO_START`
export const GET_PAID_COURSE_INFO_SUCCESS = `${prefix}/GET_PAID_COURSE_INFO_SUCCESS`
export const GET_PAID_COURSE_INFO_FAIL = `${prefix}/GET_PAID_COURSE_INFO_FAIL`

export const GET_PENDING_COURSE_INFO_REQUEST = `${prefix}/GET_PENDING_COURSE_INFO_REQUEST`
export const GET_PENDING_COURSE_INFO_START = `${prefix}/GET_PENDING_COURSE_INFO_START`
export const GET_PENDING_COURSE_INFO_SUCCESS = `${prefix}/GET_PENDING_COURSE_INFO_SUCCESS`
export const GET_PENDING_COURSE_INFO_FAIL = `${prefix}/GET_PENDING_COURSE_INFO_FAIL`

export const REFUND_PAYMENT_REQUEST = `${prefix}/REFUND_PAYMENT_REQUEST`
export const REFUND_PAYMENT_START = `${prefix}/REFUND_PAYMENT_START`
export const REFUND_PAYMENT_SUCCESS = `${prefix}/REFUND_PAYMENT_SUCCESS`
export const REFUND_PAYMENT_FAIL = `${prefix}/REFUND_PAYMENT_FAIL`

export const SET_WAITING_AUTHORIZE = `${prefix}/SET_WAITING_AUTHORIZE`
export const CLEAR_WAITING_AUTHORIZE = `${prefix}/CLEAR_WAITING_AUTHORIZE`

export const START_BILLING_BY_REDIRECT = `${prefix}/START_BILLING_BY_REDIRECT`

export const BillingStep = {
    subscription: 'subscription',
    payment: 'payment',
}

const STATE = {
    NONE : 'NONE',
    WAITING_AUTHORIZE : 'WAITING_AUTHORIZE'
}

/**
 * Reducer
 * */
const Redirect = Record({url: '', active: false})
const Waiting = Record({data: null, active: false})

export const ReducerRecord = Record({
    showBillingWindow: false,
    showCoursePaymentWindow: false,
    step: BillingStep.subscription,
    types: null,
    selectedType: null,
    fetching: false,
    processing: false,
    redirect: new Redirect(),
    error: null,
    fetchingCourseId: null,
    waiting: new Waiting(),
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_SUBSCRIPTION_TYPES_START:
        case SEND_PAYMENT_START:
            return state
                .set('error', null)
                .set('fetching', true)

        case GET_PAID_COURSE_INFO_START:
        case GET_PENDING_COURSE_INFO_START:
        case CLEAR_WAITING_AUTHORIZE:
            return state
                .set('error', null)
                .set('fetching', true)
                .set('fetchingCourseId', payload)
                .setIn(['waiting', 'data'], null)
                .setIn(['waiting', 'active'], false)

        case GET_SUBSCRIPTION_TYPES_SUCCESS:
            return state
                .set('fetching', false)
                .set('types', payload)

        case GET_PAID_COURSE_INFO_SUCCESS:
            return state
                .set('types', payload)
                .set('selectedType', payload)

        case GET_SUBSCRIPTION_TYPES_ERROR:
        case GET_PAID_COURSE_INFO_FAIL:
        case GET_PENDING_COURSE_INFO_FAIL:
        case GET_PENDING_COURSE_INFO_SUCCESS:
        case SEND_PAYMENT_ERROR:
            return state
                .set('fetching', false)

        case SHOW_BILLING_WINDOW:
            return state
                .set('error', null)
                .set('fetching', false)
                .set('showBillingWindow', true)

        case HIDE_BILLING_WINDOW:
            return state
                .set('showBillingWindow', false)

        case SHOW_COURSE_PAYMENT_WINDOW:
            return state
                .set('error', null)
                .set('fetching', false)
                .set('showCoursePaymentWindow', true)

        case HIDE_COURSE_PAYMENT_WINDOW:
            return state
                .set('showCoursePaymentWindow', false)

        case SWITCH_TO_PAYMENT:
            return state
                .set('step', BillingStep.payment)

        case SWITCH_TO_SUBSCRIPTION:
            return state
                .set('step', BillingStep.subscription)

        case SET_SUBSCRIPTION_TYPE:
            return state
                .set('selectedType', payload)

        case SEND_PAYMENT_SUCCESS: {
            let _state = state
                .set('fetching', !!payload)
                .set('showBillingWindow', false)
                .set('showCoursePaymentWindow', false)

            if (payload) {
                _state = _state
                    .setIn(['redirect', 'url'], payload)
                    .setIn(['redirect', 'active'], true)
            }

            return _state
        }

        case REDIRECT_COMPLETE:
            return state
                .setIn(['redirect', 'url'], '')
                .setIn(['redirect', 'active'], false)

        case SET_WAITING_AUTHORIZE:
            return state
                .setIn(['waiting', 'data'], Object.assign({}, payload))
                .setIn(['waiting', 'active'], true)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const showBillingWindowSelector = createSelector(stateSelector, state => state.showBillingWindow)
export const showCoursePaymentWindowSelector = createSelector(stateSelector, state => state.showCoursePaymentWindow)
export const billingStepSelector = createSelector(stateSelector, state => state.step)
export const errorSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.fetching)
export const loadingCourseIdSelector = createSelector(stateSelector, state => state.fetchingCourseId)
export const typesSelector = createSelector(stateSelector, state => state.types)
export const selectedTypeSelector = createSelector(stateSelector, state => state.selectedType)
export const redirectSelector = createSelector(stateSelector, state => state.redirect)
export const isRedirectActiveSelector = createSelector(redirectSelector, redirect => redirect.get('active'))
export const isRedirectUrlSelector = createSelector(redirectSelector, redirect => redirect.get('url'))

const isWaitingAuthorize = createSelector(stateSelector, state => state.waiting)
export const waitingDataSelector = createSelector(isWaitingAuthorize, (waiting) => {
    return waiting.active ? waiting.data : null
})

/**
 * Action Creators
 * */
export const getSubscriptionTypes = () => {
    return { type : GET_SUBSCRIPTION_TYPES_REQUEST }
}

export const sendPayment = (values) => {
    return {type: SEND_PAYMENT_REQUEST, payload: values}
}

export const getPaidCourseInfo = (data) => {
    return {type: GET_PAID_COURSE_INFO_REQUEST, payload: data}
}

export const getPendingCourseInfo = (data) => {
    return {type: GET_PENDING_COURSE_INFO_REQUEST, payload: data}
}

export const refundPayment = (paimentId) => {
    return {type: REFUND_PAYMENT_REQUEST, payload: paimentId}
}

export const showBillingWindow = () => {
    return {
        type: SHOW_BILLING_WINDOW,
        payload: null
    }
}

export const hideBillingWindow = () => {
    return {
        type: HIDE_BILLING_WINDOW,
        payload: null
    }
}

export const showCoursePaymentWindow = () => {
    return {
        type: SHOW_COURSE_PAYMENT_WINDOW,
        payload: null
    }
}

export const hideCoursePaymentWindow = () => {
    return {
        type: HIDE_COURSE_PAYMENT_WINDOW,
        payload: null
    }
}

export const switchToPayment = () => {
    return {
        type: SWITCH_TO_PAYMENT,
        payload: null
    }
}

export const switchToSubscription = () => {
    return {
        type: SWITCH_TO_SUBSCRIPTION,
        payload: null
    }
}

export const setSubscriptionType = (item) => {
    return {
        type: SET_SUBSCRIPTION_TYPE,
        payload: item
    }
}

export const redirectComplete = () => {
    return {
        type: REDIRECT_COMPLETE,
        payload: null
    }
}

export const clearWaitingAuthorize = () => {
    return {type: CLEAR_WAITING_AUTHORIZE}
}

export const setWaitingAuthorizeData = (data) => {
    return {type: SET_WAITING_AUTHORIZE, payload: data}
}

export const startBillingByRedirect = () => {
    return {type : START_BILLING_BY_REDIRECT}
}

/**
 * Sagas
 */
function* onFinishLoadProfileSaga(data) {
    console.log(data)

    const _waiting = yield select(isWaitingAuthorize)

    if (_waiting.active) {
        yield call(watchPaidCourseInfoSaga, data)
    }
}

function* watchPaidCourseInfoSaga(data) {
    const _state = yield select(state => state),
        _authorized = !!_state.user.user;

    console.log(_state.user)

    if (!_authorized) {
        yield call(_setWaitingAuthorize, data.payload)
    } else {
        yield call(_getPaidCourseInfoSaga, data.payload)
    }
}

function* _setWaitingAuthorize(data) {
    yield put({type: SET_WAITING_AUTHORIZE, payload: data})
    yield put({type: SHOW_SIGN_IN_FORM})
}

function* _getPaidCourseInfoSaga(data) {
    const _waiting = yield select(isWaitingAuthorize),
        _data = _waiting.active ? _waiting.data : data,
        _userPaidCourses = yield select(userPaidCoursesSelector)

    if (_userPaidCourses.contains(_data.courseId)) {
        yield put({type: CLEAR_WAITING_AUTHORIZE})
    } else {
        if (_data && _data.firedByPlayerBlock) {
            let _user = yield select(state => state.user)
            if (_user.isAdmin) {
                yield put({type: CLEAR_WAITING_AUTHORIZE})
                return
            }
        }

        yield put({type: GET_PAID_COURSE_INFO_START, payload: _data.courseId})

        try {
            let _fetchResult = yield call(_fetchPaidCourseInfo, _data.productId);

            _fetchResult = _fetchResult ? _fetchResult[0] : null;

            let _price = {
                Price: _fetchResult.DPrice ? _fetchResult.DPrice : _fetchResult.Price,
                Id: _fetchResult.Id,
                Title: _fetchResult.Name,
                ReturnUrl: _data.returnUrl,
            }

            yield put({type: GET_PAID_COURSE_INFO_SUCCESS, payload: _price})
            yield put({type: SHOW_COURSE_PAYMENT_WINDOW})
        } catch (error) {
            yield put({type: GET_PAID_COURSE_INFO_FAIL})
            yield put({type: HIDE_BILLING_WINDOW});
            yield put({type: HIDE_COURSE_PAYMENT_WINDOW});
            yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error}})
        }
    }
}

const _fetchPaidCourseInfo = (productId) => {
    return fetch(`/api/products?Id=${productId}&Detail=true&Truncate=true`, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* sendPaymentSaga(data) {
    yield put({type: SEND_PAYMENT_START});

    try {
        let _data = yield call(_fetchSendPayment, data.payload);

        yield put({type: SEND_PAYMENT_SUCCESS, payload: _data.confirmationUrl})
        yield put({type: RELOAD_CURRENT_PAGE_REQUEST})
    } catch (error) {
        yield put({type: SEND_PAYMENT_ERROR, payload: {error}});
        yield put({type: HIDE_BILLING_WINDOW});
        yield put({type: HIDE_COURSE_PAYMENT_WINDOW});
        yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error}})
    }
}

const _fetchSendPayment = (values) => {
    return fetch('/api/payments', {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(values),
        credentials: 'include',
        redirect: 'manual'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* getSubscriptionTypesSaga() {
    yield put({type: GET_SUBSCRIPTION_TYPES_START})

    try {
        const _billingParams = yield select(billingParamsSelector),
            _str = $.param(_billingParams),
            _url = '/api/products' + (_str ? '?' + _str : '');

        const _data = yield call(_fetchSubscriptionTypes, _url)

        yield put({ type: GET_SUBSCRIPTION_TYPES_SUCCESS, payload: _data })
    } catch (error) {
        yield put({type: GET_SUBSCRIPTION_TYPES_ERROR})
        yield put({type: HIDE_BILLING_WINDOW});
        yield put({type: HIDE_COURSE_PAYMENT_WINDOW});
        yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error}})
    }
}

const _fetchSubscriptionTypes = (url) => {
    return fetch(url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* getPendingCourseInfoSaga(data){
    yield put({type: SHOW_WAITING_FORM})
    yield put({type: GET_PENDING_COURSE_INFO_START, payload: data.payload.courseId})

    try {
        let _data = yield call(_fetchPendingCourseInfo, data.payload.courseId);

        if (_data && _data.confirmationUrl) {
            yield put({type: SEND_PAYMENT_SUCCESS, payload: _data.confirmationUrl})
        } else {
            yield put({type: GET_PENDING_COURSE_INFO_SUCCESS})
            yield put({type: HIDE_BILLING_WINDOW})
        }
    } catch (error) {
        const COURSE_IS_BOUGHT = 'Этот курс Вами уже куплен'
        switch (+error.status) {
            case 404 : {
                yield put({type: GET_PAID_COURSE_INFO_REQUEST, payload: data.payload})
                yield put({type: HIDE_WAITING_FORM})
                return
            }

            case 409: {
                yield put({type: GET_PENDING_COURSE_INFO_FAIL})
                yield put({type: HIDE_WAITING_FORM});
                yield put({type: HIDE_COURSE_PAYMENT_WINDOW});
                yield put({type: HIDE_BILLING_WINDOW})
                yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error : new Error(COURSE_IS_BOUGHT)}})
                yield put({type: RELOAD_CURRENT_PAGE_REQUEST})
                return
            }

            default: {
                yield put({type: GET_PENDING_COURSE_INFO_FAIL})
                yield put({type: HIDE_WAITING_FORM});
                yield put({type: HIDE_COURSE_PAYMENT_WINDOW});
                yield put({type: HIDE_BILLING_WINDOW})
                yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error}})
                return
            }
        }
    }
}

const _fetchPendingCourseInfo = (courseId)  => {
    return fetch(`/api/payments/pending/course/${courseId}`, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* refundPaymentSaga(data) {
    yield put({type: REFUND_PAYMENT_START})

    try {
        yield call(_fetchSendPayment, data.payload)

        yield put({ type: REFUND_PAYMENT_SUCCESS })
        yield put({ type: GET_TRANSACTIONS_REQUEST })
    } catch (error) {
        yield put({type: REFUND_PAYMENT_FAIL})
        yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error}})
    }
}


export const saga = function* () {
    yield all([
        takeEvery(GET_PAID_COURSE_INFO_REQUEST, watchPaidCourseInfoSaga),
        takeEvery(GET_SUBSCRIPTION_TYPES_REQUEST, getSubscriptionTypesSaga),
        takeEvery(SEND_PAYMENT_REQUEST, sendPaymentSaga),
        takeEvery(GET_PENDING_COURSE_INFO_REQUEST, getPendingCourseInfoSaga),
        takeEvery(REFUND_PAYMENT_REQUEST, refundPaymentSaga),
        takeEvery([FINISH_LOAD_PROFILE, START_BILLING_BY_REDIRECT], onFinishLoadProfileSaga),
    ])
}


