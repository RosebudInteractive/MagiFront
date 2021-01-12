import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {all, takeEvery, put, call, select, fork,} from 'redux-saga/effects'
import $ from "jquery";

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

export const CLEAR_WAITING_AUTHORIZE = `${prefix}/CLEAR_WAITING_AUTHORIZE`

export const NOTIFY_GA_CHANGE_PAGE_REQUEST = `${prefix}/NOTIFY_GA_CHANGE_PAGE_REQUEST`;
export const NOTIFY_GA_CHANGE_PAGE = `${prefix}/NOTIFY_GA_CHANGE_PAGE`;
export const APP_CHANGE_PAGE = `${prefix}/APP_CHANGE_PAGE`;
export const SET_CURRENT_GA_URL = `${prefix}/SET_CURRENT_URL`;

const STORE_POPUP_CLOSE_REQUEST = `${prefix}/STORE_POPUP_CLOSE_REQUEST`;
const SALE2021_POPUP_CLOSE_REQUEST = `${prefix}/SALE2021_POPUP_CLOSE_REQUEST`;
const CONFIRM_COOKIES_REQUEST = `${prefix}/CONFIRM_COOKIES_REQUEST`;

const LOAD_LOCAL_SETTINGS_REQUEST = `${prefix}/LOAD_LOCAL_SETTINGS_REQUEST`;
const APPLY_LOCAL_SETTINGS = `${prefix}/APPLY_LOCAL_SETTINGS`;
const SET_APP_DIV_TOP_REQUEST = `${prefix}/SET_APP_DIV_TOP_REQUEST`;
const SET_APP_DIV_TOP = `${prefix}/SET_APP_DIV_TOP`;

const Billing = Record({
    mode: {courses: false, subscription: false},
    billing_test: false,
    self_refund: false,
    productReqParams: null,
})

const DebugRecord = Record({
    lsnPositions: false,
    gtm: true,
})

const StatRecord = Record({
    clientTimeout: 10 * 60
})

const PopupSettings = Record({
    storePopupConfirmedMode: null,
    sale2021PopupConfirmed: false,
    cookiesConfirmed: true
})

const LocalSettings = Record({
    popup: new PopupSettings(),
    appWrapperTop: 0
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
    currentUrl: null,
    debug: new DebugRecord(),
    stat: new StatRecord(),
    localSettings: new LocalSettings()
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
                .set('debug', new DebugRecord(payload.debug))
                .set('stat', new StatRecord(payload.stat))

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

        case SET_CURRENT_GA_URL:
            return state
                .set('currentUrl', payload)

        case APPLY_LOCAL_SETTINGS:
            return state
                .set("localSettings", new LocalSettings(payload))

        case SET_APP_DIV_TOP:
            return state
                .setIn(["localSettings", "appWrapperTop"], payload)

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
export const analyticsDebugModeSelector = createSelector(stateSelector, state => state.getIn(['debug', 'gtm']))
const currentUrlSelector = createSelector(stateSelector, state => state.currentUrl)
export const paymentPingIntervalSelector = createSelector(stateSelector, state => state.getIn(['stat', 'clientTimeout']))
export const localSettingsSelector = createSelector(stateSelector, state => state.localSettings)


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

export const clearWaitingAuthorize = () => {
    return {type: CLEAR_WAITING_AUTHORIZE}
}

export const notifyAnalyticsChangePage = (url) => {
    return {type: NOTIFY_GA_CHANGE_PAGE_REQUEST, payload: url}
}

export const pageChanged = () => {
    return {type: APP_CHANGE_PAGE}
}

export const storePopupClose = (mode) => {
    return {type: STORE_POPUP_CLOSE_REQUEST, payload: mode}
}

export const sale2021PopupClose = () => {
    return {type: SALE2021_POPUP_CLOSE_REQUEST}
}

export const cookiesMessageClose = () => {
    return {type: CONFIRM_COOKIES_REQUEST}
}

export const loadLocalSettings = () => {
    return {type: LOAD_LOCAL_SETTINGS_REQUEST}
}

export const setAppDivTop = (value) => {
    return {type: SET_APP_DIV_TOP_REQUEST, payload: value}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_OPTIONS_REQUEST, getOptionsSaga),
        takeEvery(CALC_BILLING_ENABLE_REQUEST, calcBillingEnabledSaga),
        takeEvery(RELOAD_CURRENT_PAGE_REQUEST, reloadCurrentPageSaga),
        takeEvery(NOTIFY_GA_CHANGE_PAGE_REQUEST, changeCurrentPageSaga),
        takeEvery(CONFIRM_COOKIES_REQUEST, cookiesMessageCloseSaga),
        takeEvery(STORE_POPUP_CLOSE_REQUEST, storePopupCloseSaga),
        takeEvery(SALE2021_POPUP_CLOSE_REQUEST, sale2021PopupCloseSaga),
        takeEvery(LOAD_LOCAL_SETTINGS_REQUEST, loadLocalSettingsSaga),
        takeEvery(SET_APP_DIV_TOP_REQUEST, setAppDivTopSaga),
    ])
}

function* changeCurrentPageSaga(data) {
    const _currentUrl = yield select(currentUrlSelector),
        _newUrl = data.payload

    if (_currentUrl !== _newUrl) {

        if (!!_currentUrl) { yield put({type: NOTIFY_GA_CHANGE_PAGE, payload: _newUrl}) }

        yield put({type: SET_CURRENT_GA_URL, payload: _newUrl})

    }
}


function* getOptionsSaga() {
    yield put({type: GET_OPTIONS_START})
    try {
        let _options = yield call(fetchOptions)

        yield put({type: GET_OPTIONS_SUCCESS, payload: _options})

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

function* cookiesMessageCloseSaga() {
    let _date = new Date(new Date().setFullYear(new Date().getFullYear() + 10))

    $.cookie('magisteria_cookies_confirm', true, { expires: _date, path: "/" })

    yield put(loadLocalSettings())
}

function* storePopupCloseSaga(data) {
    let _date = new Date(new Date().setFullYear(new Date().getFullYear() + 10))

    $.cookie('_CONFIRMED_STORE_POPUP_MODE', data.payload, { expires: _date, path: "/" })

    yield put(loadLocalSettings())
}

function* sale2021PopupCloseSaga() {
    let _date = new Date(new Date().setFullYear(new Date().getFullYear() + 10))

    $.cookie('_CONFIRMED_SALE2021_POPUP', true, { expires: _date, path: "/" })

    yield put(loadLocalSettings())
}

function* loadLocalSettingsSaga() {
    let cookiesConfirmed = !!$.cookie('magisteria_cookies_confirm'),
        storePopupConfirmedMode = $.cookie('_CONFIRMED_STORE_POPUP_MODE'),
        sale2021PopupConfirmed = !!$.cookie('_CONFIRMED_SALE2021_POPUP')

    storePopupConfirmedMode = storePopupConfirmedMode ? +storePopupConfirmedMode : 0

    const _settings = {
        popup: {cookiesConfirmed, storePopupConfirmedMode, sale2021PopupConfirmed}
    }

    yield put({type: APPLY_LOCAL_SETTINGS, payload: _settings})
}

function* setAppDivTopSaga(data) {
    const _current = yield select(loadLocalSettings)

    if (_current.appWrapperTop !== data.payload) {
        $(".App.global-wrapper").css("top", data.payload + "px")
        yield put({type: SET_APP_DIV_TOP, payload: data.payload})
    }
}
