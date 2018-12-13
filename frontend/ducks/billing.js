import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";


/**
 * Constants
 * */
export const moduleName = 'billing'
const prefix = `${appName}/${moduleName}`

export const SHOW_BILLING_WINDOW = `${prefix}/SHOW_BILLING_WINDOW`
export const HIDE_BILLING_WINDOW = `${prefix}/HIDE_BILLING_WINDOW`
export const SEND_PAYMENT_START = `${prefix}/SEND_PAYMENT_START`
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
    fetching: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        // case MAIL_SUBSCRIBE_START:
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
        // case MAIL_SUBSCRIBE_SUCCESS:
        //     return state
        //         .set('fetching', false)

        // case MAIL_SUBSCRIBE_ERROR:
        // case SEND_FEEDBACK_ERROR:
        //     return state
        //         .set('fetching', false)
        //         .set('error', payload.error)
        //         .set('showFeedbackWindow', false)
        //         .set('showFeedbackResultMessage', true)

        case SHOW_BILLING_WINDOW:
            return state
                .set('error', null)
                .set('fetching', false)
                .set('showBillingWindow', true)

        case HIDE_BILLING_WINDOW:
            return state
                .set('showFeedbackWindow', false)

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


