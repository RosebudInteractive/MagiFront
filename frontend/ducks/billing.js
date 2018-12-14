import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {GET_AUTHOR_ERROR, GET_AUTHOR_REQUEST, GET_AUTHOR_SUCCESS, SET_NOT_FOUND} from "./author";


/**
 * Constants
 * */
export const moduleName = 'billing'
const prefix = `${appName}/${moduleName}`

export const SHOW_BILLING_WINDOW = `${prefix}/SHOW_BILLING_WINDOW`
export const HIDE_BILLING_WINDOW = `${prefix}/HIDE_BILLING_WINDOW`
export const SEND_PAYMENT_START = `${prefix}/SEND_PAYMENT_START`
export const SWITCH_TO_PAYMENT = `${prefix}/SWITCH_TO_PAYMENT`
export const SWITCH_TO_SUBSCRIPTION = `${prefix}/SWITCH_TO_SUBSCRIPTION`
export const GET_SUBSCRIPTION_TYPES_START = `${prefix}/GET_SUBSCRIPTION_TYPES_START`
export const GET_SUBSCRIPTION_TYPES_SUCCESS = `${prefix}/GET_SUBSCRIPTION_TYPES_SUCCESS`
export const GET_SUBSCRIPTION_TYPES_ERROR = `${prefix}/GET_SUBSCRIPTION_TYPES_ERROR`
export const SEND_PAYMENT_SUCCESS = `${prefix}/SEND_PAYMENT_SUCCESS`
export const SEND_PAYMENT_ERROR = `${prefix}/SEND_PAYMENT_ERROR`

export const BillingStep = {
    subscription: 'subscription',
    payment: 'payment',
}

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    showBillingWindow: false,
    step: BillingStep.subscription,
    types: null,
    fetching: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_SUBSCRIPTION_TYPES_START:
        case SEND_PAYMENT_START:
            return state
                .set('error', null)
                .set('fetching', true)

        // case SEND_FEEDBACK_SUCCESS:
        //     return state
        //         .set('fetching', false)
        //         .set('showFeedbackWindow', false)
        //         .set('showFeedbackResultMessage', true)
        //
        case GET_SUBSCRIPTION_TYPES_SUCCESS:
            return state
                .set('fetching', false)

        // case MAIL_SUBSCRIBE_ERROR:
        case GET_SUBSCRIPTION_TYPES_ERROR:
            return state
                .set('fetching', false)
                .set('error', payload.error)
                .set('showFeedbackWindow', false)
                .set('showFeedbackResultMessage', true)

        case SHOW_BILLING_WINDOW:
            return state
                .set('error', null)
                .set('fetching', false)
                .set('showBillingWindow', true)

        case HIDE_BILLING_WINDOW:
            return state
                .set('showBillingWindow', false)

        case SWITCH_TO_PAYMENT:
            return state
                .set('step', BillingStep.payment)

        case SWITCH_TO_SUBSCRIPTION:
            return state
                .set('step', BillingStep.subscription)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const showBillingWindowSelector = createSelector(stateSelector, state => state.showBillingWindow)
export const billingStepSelector = createSelector(stateSelector, state => state.step)
export const errorMessageSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.fetching)

/**
 * Action Creators
 * */
export function getSubscriptionTypes() {
    return (dispatch) => {
        dispatch({
            type: GET_SUBSCRIPTION_TYPES_START,
            payload: null
        });

        fetch("/api/products?Codes=SUBS1M,SUBS3M,SUBS1Y&Detail=true", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                // handleData(data);
                dispatch({
                    type: GET_SUBSCRIPTION_TYPES_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_SUBSCRIPTION_TYPES_ERROR,
                    payload: err
                });
            });
    }
}

// export const sendFeedback = (values) => {
//     return (dispatch) => {
//         dispatch({
//             type: SEND_FEEDBACK_START,
//             payload: null
//         });
//
//         fetch('/api/feedback', {
//             method: 'POST',
//             headers: {
//                 "Content-type": "application/json"
//             },
//             body: JSON.stringify(values),
//             credentials: 'include'
//         })
//             .then(checkStatus)
//             .then(parseJSON)
//             .then(() => {
//                 dispatch({
//                     type: SEND_FEEDBACK_SUCCESS,
//                     payload: null
//                 });
//             })
//             .catch((error) => {
//                 dispatch({
//                     type: SEND_FEEDBACK_ERROR,
//                     payload: {error}
//                 });
//             });
//     }
// }

//api/products?Codes=SUBS1M,SUBS3M,SUBS1Y&Detail=true

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

export const switchToPayment = () => {
    return {
        type: SWITCH_TO_PAYMENT,
        payload: null
    }
}


