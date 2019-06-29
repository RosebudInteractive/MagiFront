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
import {FINISH_LOAD_PROFILE, GET_TRANSACTIONS_REQUEST,} from "ducks/profile";
import {SHOW_SIGN_IN_FORM,} from "../constants/user";
import {CLEAR_WAITING_AUTHORIZE,} from "ducks/app";

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

export const REDIRECT_TO_BOUGHT_COURSE = `${prefix}/REDIRECT_TO_BOUGHT_COURSE`
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

export const START_BILLING_BY_REDIRECT = `${prefix}/START_BILLING_BY_REDIRECT`

export const APPLY_PROMO_REQUEST = `${prefix}/APPLY_PROMO_REQUEST`
export const APPLY_PROMO_START = `${prefix}/APPLY_PROMO_START`
export const APPLY_PROMO_SUCCESS = `${prefix}/APPLY_PROMO_SUCCESS`
export const APPLY_PROMO_FAIL = `${prefix}/APPLY_PROMO_FAIL`
export const APPLY_PROMO_ERROR = `${prefix}/APPLY_PROMO_ERROR`

export const CLEAR_PROMO = `${prefix}/CLEAR_PROMO`

export const SET_PRODUCT_PRICE = `${prefix}/SET_PRODUCT_PRICE`

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
const Promo = Record({
    checkingValue: '',
    checked: false,
    fetching: false,
    id: null,
    perc: 0,
    sum: 0,
    error: ''
})

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
    promo: new Promo()
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
                .set('promo', new Promo())

        case SWITCH_TO_PAYMENT:
            return state
                .set('step', BillingStep.payment)

        case SWITCH_TO_SUBSCRIPTION:
            return state
                .set('step', BillingStep.subscription)

        case SET_SUBSCRIPTION_TYPE:
            return state
                .set('selectedType', payload)

        case SEND_PAYMENT_SUCCESS:
        case REDIRECT_TO_BOUGHT_COURSE: {
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

        case APPLY_PROMO_START:
            return state
                .setIn(['promo', 'checkingValue'], payload)
                .setIn(['promo', 'checked'], false)
                .setIn(['promo', 'fetching'], true)
                .setIn(['promo', 'error'], false)

        case APPLY_PROMO_SUCCESS:
            return state
                // .setIn(['promo', 'checkingValue'], payload.promo)
                .setIn(['promo', 'fetching'], false)
                .setIn(['promo', 'checked'], true)
                .setIn(['promo', 'perc'], payload.perc ? payload.perc : null)
                .setIn(['promo', 'sum'], payload.sum ? payload.sum : null)
                .setIn(['promo', 'error'], false)

        case APPLY_PROMO_FAIL:
            return state
                .setIn(['promo', 'checkingValue'], "")
                .setIn(['promo', 'checked'], true)
                .setIn(['promo', 'fetching'], false)

        case APPLY_PROMO_ERROR:
            return state
                .setIn(['promo', 'checkingValue'], "")
                .setIn(['promo', 'checked'], true)
                .setIn(['promo', 'fetching'], false)
                .setIn(['promo', 'error'], true)
                .setIn(['promo', 'perc'], null)
                .setIn(['promo', 'sum'], null)

        case CLEAR_PROMO:
            return state
                .set('promo', new Promo())
                .update('selectedType', (selected) => {
                    if (selected.Promo) {
                        let _new = Object.assign({}, selected)
                        _new.Promo = null
                        return _new
                    } else {
                        return selected
                    }
                })

        case SET_PRODUCT_PRICE:
            return state
                .update('selectedType', (selected) => {
                    let _new = Object.assign({}, selected)
                    _new.Promo = Object.assign({}, payload)
                    return _new
                })

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
export const priceSelector = createSelector(selectedTypeSelector, (selected) => {
    return selected.Promo ?
        selected.Promo.Sum < selected.Price ? selected.Promo.Sum : selected.Price
        :
        selected.Price
})
export const redirectSelector = createSelector(stateSelector, state => state.redirect)
export const isRedirectActiveSelector = createSelector(redirectSelector, redirect => redirect.get('active'))
export const isRedirectUrlSelector = createSelector(redirectSelector, redirect => redirect.get('url'))

const isWaitingAuthorize = createSelector(stateSelector, state => state.waiting)
export const waitingDataSelector = createSelector(isWaitingAuthorize, (waiting) => {
    return waiting.active ? waiting.data : null
})

const promoSelector = createSelector(stateSelector, state => state.promo)
const promoCheckingValueSelector = createSelector(promoSelector, promo => promo.checkingValue)
export const promoValuesSelector = createSelector(promoSelector, (promo) => {
    return {
        checked : promo.checked,
        percent: promo.perc,
        sum: promo.sum,
        error: promo.error,
    }
})
export const promoFetchingSelector = createSelector(promoSelector, promo => promo.fetching)

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

export const setWaitingAuthorizeData = (data) => {
    return {type: SET_WAITING_AUTHORIZE, payload: data}
}

export const startBillingByRedirect = () => {
    return {type : START_BILLING_BY_REDIRECT}
}

export const applyPromo = (data) => {
    return {type: APPLY_PROMO_REQUEST, payload: data}
}

export const clearPromo = () => {
    return {type: CLEAR_PROMO}
}

/**
 * Sagas
 */
function* onFinishLoadProfileSaga(data) {
    const _waiting = yield select(isWaitingAuthorize)

    if (_waiting.active) {
        yield call(watchPaidCourseInfoSaga, data)
    }
}

function* watchPaidCourseInfoSaga(data) {
    const _state = yield select(state => state),
        _authorized = !!_state.user.user;

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
        _user = yield select(state => state.user)

    try {
        let _course = yield call(_fetchCoursePriceInfo, {courseId : _data.courseId})

        const _isPaidCourse = (_course.IsPaid && !_course.IsGift && !_course.IsBought),
            _eventFiredByPlayer = _data && _data.firedByPlayerBlock,
            _needClearAuthWaiting = !_isPaidCourse || (_eventFiredByPlayer && _user.isAdmin)

        if (_needClearAuthWaiting) {
            yield put({type: CLEAR_WAITING_AUTHORIZE})
            yield put({type: REDIRECT_TO_BOUGHT_COURSE, payload: _data.returnUrl})
        } else {
            if (_course.IsPending) {
                yield put({type: GET_PENDING_COURSE_INFO_REQUEST, payload: _data})
            } else {
                yield put({type: GET_PAID_COURSE_INFO_START, payload: _data.courseId})
                let _offer = {
                    Price: _course.DPrice ? _course.DPrice : _course.Price,
                    Id: _course.ProductId,
                    Title: _course.ProductName,
                    ReturnUrl: _data.returnUrl,
                    CourseId: _course.Id,
                    CourseName: _data.name,
                    Author: _data.author,
                    Category: _data.category,
                }

                yield put({type: GET_PAID_COURSE_INFO_SUCCESS, payload: _offer})
                yield put({type: SHOW_COURSE_PAYMENT_WINDOW})
            }
        }
    } catch (error) {
        yield put({type: GET_PAID_COURSE_INFO_FAIL})
        yield put({type: HIDE_BILLING_WINDOW});
        yield put({type: HIDE_COURSE_PAYMENT_WINDOW});
        yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error}})
    }
}

const _fetchCoursePriceInfo = ({courseId, promo}) => {
    let _url = `/api/courses/price-info/${courseId}`

    _url += promo ? `?promo=${promo}` : ''

    return fetch(_url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* sendPaymentSaga(data) {

    console.log(data)

    yield put({type: SEND_PAYMENT_START});

    try {
        if (data.payload.courseId) {
            let _course = yield call(_fetchCoursePriceInfo, {courseId : data.payload.courseId})
            const _isPaidCourse = (_course.IsPaid && !_course.IsGift && !_course.IsBought)
            if (!_isPaidCourse) {return}
        }

        let _data = yield call(_fetchSendPayment, data.payload);

        let _redirectUrl = (_data && _data.confirmationUrl) ? _data.confirmationUrl : data.payload.Payment.returnUrl
        yield put({type: SEND_PAYMENT_SUCCESS, payload: _redirectUrl})
        yield put({type: RELOAD_CURRENT_PAGE_REQUEST})
    } catch (error) {
        console.log(data)

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

function* applyPromoSaga(action) {
    const _selectedMethod = yield select(selectedTypeSelector)

    if (!_selectedMethod.CourseId) {
        return
    }

    yield put({type: APPLY_PROMO_START, payload: action.payload})

    try {
        let _data = yield call(_fetchCoursePriceInfo, {courseId: _selectedMethod.CourseId, promo: action.payload})
        const _checkingValue = yield select(promoCheckingValueSelector)

        if (_checkingValue === action.payload) {


            if (_data.Promo) {
                const _coursePrice = _data.DPrice ? _data.DPrice : _data.Price,
                    _promoPrice = _data.Promo ? _data.Promo.Sum : undefined;

                let _promo = {}

                if ((_promoPrice !== undefined) && (_promoPrice < _coursePrice)) {
                    _promo.perc = _data.Promo.Perc
                    _promo.sum = _data.Promo.PromoSum

                    yield put({type: SET_PRODUCT_PRICE, payload: _data.Promo})
                }

                yield put({type: APPLY_PROMO_SUCCESS, payload: _promo})
            } else {
                yield put({type: APPLY_PROMO_ERROR})
            }
        }
    } catch (error) {
        const _checkingValue = yield select(promoCheckingValueSelector)

        if (_checkingValue === action.payload) {
            yield put({type: APPLY_PROMO_FAIL})
        }
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
        takeEvery(APPLY_PROMO_REQUEST, applyPromoSaga),
    ])
}


