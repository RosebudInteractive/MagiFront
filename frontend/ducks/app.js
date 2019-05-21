import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {all, takeEvery, put, call, select, fork,} from 'redux-saga/effects'

/**
 * Constants
 * */
export const moduleName = 'app_ver_2'
const prefix = `${appName}/${moduleName}`

export const GET_OPTIONS_REQUEST = `${prefix}/GET_OPTIONS_REQUEST`
export const GET_OPTIONS_START = `${prefix}/GET_OPTIONS_START`
export const GET_OPTIONS_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
export const GET_OPTIONS_FAIL = `${prefix}/GET_OPTIONS_FAIL`

export const CALC_BILLING_ENABLE_REQUEST = `${prefix}/CALC_BILLING_ENABLE_REQUEST`
export const DISABLE_BILLING = `${prefix}/DISABLE_BILLING`
export const ENABLE_BILLING = `${prefix}/ENABLE_BILLING`

export const SET_CURRENT_PAGE = `${prefix}/SET_CURRENT_PAGE`
export const RELOAD_CURRENT_PAGE_REQUEST = `${prefix}/RELOAD_CURRENT_PAGE_REQUEST`
export const RELOAD_CURRENT_PAGE_START = `${prefix}/RELOAD_CURRENT_PAGE_START`
export const RELOAD_CURRENT_PAGE_SUCCESS = `${prefix}/RELOAD_CURRENT_PAGE_SUCCESS`

export const SHOW_WAITING_FORM = `${prefix}/SHOW_WAITING_FORM`
export const HIDE_WAITING_FORM = `${prefix}/HIDE_WAITING_FORM`

const Billing = Record({
    mode: {courses: false, subscription: false},
    billing_test: false,
    self_refund: false,
    productReqParams: null,
})
/**
 * Reducer
 * */
export const ReducerRecord = Record({
    billing: new Billing(),
    facebookAppID: '',
    reCapture: '',
    enabledBilling: false,
    fetching: false,
    currentPageRef: null,
    isWaiting: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_OPTIONS_REQUEST:
            return state
                .set('billing', new Billing())
                .set('reCapture', '')

        case GET_OPTIONS_START:
            return state
                .set('fetching', true)

        case GET_OPTIONS_SUCCESS:
            return state
                .set('reCapture', payload.siteKey.reCapture)
                .set('facebookAppID', payload.appId.fb)
                .set('billing', new Billing(payload.billing))
                .set('fetching', false)

        case GET_OPTIONS_FAIL:
            return state
                .set('fetching', false)

        case ENABLE_BILLING:
            return state
                .set('enabledBilling', true)

        case DISABLE_BILLING:
            return state
                .set('enabledBilling', false)

        case SET_CURRENT_PAGE:
            return state
                .set('currentPageRef', payload)

        case SHOW_WAITING_FORM:
            return state
                .set('isWaiting', true)

        case HIDE_WAITING_FORM:
            return state
                .set('isWaiting', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */
export const stateSelector = state => state[moduleName]
export const billingTestModeSelector = createSelector(stateSelector, state => state.getIn(['billing', 'billing_test']))
export const enableRefundSelector = createSelector(stateSelector, state => state.getIn(['billing', 'self_refund']))
export const billingParamsSelector = createSelector(stateSelector, state => state.getIn(['billing', 'productReqParams']))
export const enabledBillingSelector = createSelector(stateSelector, state => state.enabledBilling)
export const reCaptureSelector = createSelector(stateSelector, state => state.reCapture)
export const facebookAppIdSelector = createSelector(stateSelector, state => state.facebookAppID)
export const fetchingSelector = createSelector(stateSelector, state => state.fetching)
export const enabledSubscriptionSelector = createSelector(stateSelector, (state) => {
    const _enable = state.get('enabledBilling'),
        _mode = state.getIn(['billing', 'mode'])

    return _enable && _mode.subscription
})
export const enabledPaidCoursesSelector = createSelector(stateSelector, (state) => {
    const _enable = state.get('enabledBilling'),
        _mode = state.getIn(['billing', 'mode'])

    return _enable && _mode.courses
})

const currentPageRefSelector = createSelector(stateSelector, state => state.currentPageRef)
export const waitingSelector = createSelector(stateSelector, state => state.isWaiting)


/**
 * Action Creators
 * */
export const getAppOptions = () => {
    return {type: GET_OPTIONS_REQUEST}
}

export const calcBillingEnable = () => {
    return {type: CALC_BILLING_ENABLE_REQUEST}
}

export const setCurrentPage = (instance) => {
    return {type: SET_CURRENT_PAGE, payload: instance}
}

export const clearCurrentPage = () => {
    return {type: SET_CURRENT_PAGE, payload: null}
}

export const reloadCurrentPage = () => {
    return {type: RELOAD_CURRENT_PAGE_REQUEST}
}


/**
 * Sagas
 */
function* getOptionsSaga() {
    yield put({type: GET_OPTIONS_START})
    try {
        let _options = yield call(fetchOptions)

        yield put({type: GET_OPTIONS_SUCCESS, payload: _options})

        let _state = yield select(stateSelector)
        console.log(_state);


        yield fork(calcBillingEnabledSaga)
    } catch (error) {
        yield put({type: GET_OPTIONS_FAIL, payload: {error}})
    }
}

const fetchOptions = () => {
    return fetch("/api/options", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

export function* calcBillingEnabledSaga() {
    const state = yield select(state => state)

    const enabledBilling = yield select(enabledBillingSelector),
        _billingTest = yield select(billingTestModeSelector)

    let _user = state.user.user,
        _enabled = false;

    if (_billingTest) {
        _enabled = !!_user && ((_user.PData && _user.PData.isAdmin) || (_user.PData && _user.PData.roles && _user.PData.roles.billing_test))
    } else {
        _enabled = true
    }

    if (enabledBilling !== _enabled) {
        if (_enabled) {
            yield put({type: ENABLE_BILLING})
        } else {
            yield put({type: DISABLE_BILLING})
        }
    }
}

function* reloadCurrentPageSaga() {
    const _ref = yield select(currentPageRefSelector)

    if (_ref && (typeof _ref === 'object') && _ref.reload) {
        yield put({type: RELOAD_CURRENT_PAGE_START})
        _ref.reload()

        yield put({type: RELOAD_CURRENT_PAGE_SUCCESS})
    }
}

export const saga = function* () {
    yield all([
        takeEvery(GET_OPTIONS_REQUEST, getOptionsSaga),
        takeEvery(CALC_BILLING_ENABLE_REQUEST, calcBillingEnabledSaga),
        takeEvery(RELOAD_CURRENT_PAGE_REQUEST, reloadCurrentPageSaga),
    ])
}