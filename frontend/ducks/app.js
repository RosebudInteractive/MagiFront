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

const Mode = Record({course: false, subscription: false})

const Billing = Record({
    mode: new Mode(),
    billing_test: false,
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

        default:
            return state
    }
}

/**
 * Selectors
 * */
export const stateSelector = state => state[moduleName]
export const enabledBillingSelector = createSelector(stateSelector, state => state.enabledBilling)
export const reCaptureSelector = createSelector(stateSelector, state => state.reCapture)
export const facebookAppIdSelector = createSelector(stateSelector, state => state.facebookAppID)
export const fetchingAppIdSelector = createSelector(stateSelector, state => state.fetching)
export const enabledSubscriptionSelector = createSelector(stateSelector, (state) => {
    const _enable = state.get('enabledBilling'),
        _subscriptionEnable = state.getIn(['billing', 'mode', 'subscription'])

    return _enable && _subscriptionEnable
})
export const enabledPaidCoursesSelector = createSelector(stateSelector, (state) => {
    const _enable = state.get('enabledBilling'),
        _paidCoursesEnable = state.getIn(['billing', 'mode', 'course'])

    return _enable && _paidCoursesEnable
})


/**
 * Action Creators
 * */
export const getAppOptions = () => {
    return {type: GET_OPTIONS_REQUEST}
}

export const calcBillingEnable = () => {
    return {type: CALC_BILLING_ENABLE_REQUEST}
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

    const enabledBilling = yield select(enabledBillingSelector)

    let _user = state.user.user,
        _app = state.app,
        _enabled = false;

    if (_app.billingTest) {
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

export const saga = function* () {
    yield all([
        takeEvery(GET_OPTIONS_REQUEST, getOptionsSaga),
        takeEvery(CALC_BILLING_ENABLE_REQUEST, calcBillingEnabledSaga),
    ])
}