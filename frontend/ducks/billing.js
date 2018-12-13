import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {reset} from "redux-form";
import {
    HIDE_FEEDBACK_RESULT_MESSAGE, HIDE_FEEDBACK_WINDOW,
    MAIL_SUBSCRIBE_ERROR, MAIL_SUBSCRIBE_START,
    MAIL_SUBSCRIBE_SUCCESS,
    SEND_FEEDBACK_ERROR,
    SEND_FEEDBACK_START, SEND_FEEDBACK_SUCCESS, SHOW_FEEDBACK_RESULT_MESSAGE,
    SHOW_FEEDBACK_WINDOW
} from "./message";

/**
 * Constants
 * */
export const moduleName = 'billing'
const prefix = `${appName}/${moduleName}`

export const SHOW_BILLING_WINDOW = `${prefix}/SHOW_BILLING_WINDOW`
export const HIDE_BILLING_WINDOW = `${prefix}/HIDE_BILLING_WINDOW`
// export const SHOW_FEEDBACK_RESULT_MESSAGE = `${prefix}/SHOW_FEEDBACK_RESULT_MESSAGE`
// export const HIDE_FEEDBACK_RESULT_MESSAGE = `${prefix}/HIDE_FEEDBACK_RESULT_MESSAGE`
export const SEND_PAYMENT_START = `${prefix}/SEND_PAYMENT_START`
export const SEND_PAYMENT_SUCCESS = `${prefix}/SEND_PAYMENT_SUCCESS`
export const SEND_PAYMENT_ERROR = `${prefix}/SEND_PAYMENT_ERROR`
// export const MAIL_SUBSCRIBE_START = `${prefix}/MAIL_SUBSCRIBE_START`
// export const MAIL_SUBSCRIBE_SUCCESS = `${prefix}/MAIL_SUBSCRIBE_SUCCESS`
// export const MAIL_SUBSCRIBE_ERROR = `${prefix}/MAIL_SUBSCRIBE_ERROR`

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

        case SEND_FEEDBACK_SUCCESS:
            return state
                .set('fetching', false)
                .set('showFeedbackWindow', false)
                .set('showFeedbackResultMessage', true)

        case MAIL_SUBSCRIBE_SUCCESS:
            return state
                .set('fetching', false)
        // .set('showFeedbackWindow', false)
        // .set('showFeedbackResultMessage', true)
        // .set('successMessage', 'Подписка успешно добавлена')

        case MAIL_SUBSCRIBE_ERROR:
        case SEND_FEEDBACK_ERROR:
            return state
                .set('fetching', false)
                .set('error', payload.error)
                .set('showFeedbackWindow', false)
                .set('showFeedbackResultMessage', true)

        case SHOW_FEEDBACK_WINDOW:
            return state
                .set('error', null)
                .set('fetching', false)
                .set('showFeedbackWindow', true)

        case HIDE_FEEDBACK_WINDOW:
            return state
                .set('showFeedbackWindow', false)

        case SHOW_FEEDBACK_RESULT_MESSAGE:
            return state
                .set('showFeedbackResultMessage', true)

        case HIDE_FEEDBACK_RESULT_MESSAGE:
            return state
                .set('showFeedbackResultMessage', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const showBillingWindowSelector = createSelector(stateSelector, state => state.showBillingWindow)
export const billingStepSelector = createSelector(stateSelector, state => state.billingStepSelector)
export const errorMessageSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.fetching)

/**
 * Action Creators
 * */
export const sendFeedback = (values) => {
    return (dispatch) => {
        dispatch({
            type: SEND_FEEDBACK_START,
            payload: null
        });

        fetch('/api/feedback', {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(values),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: SEND_FEEDBACK_SUCCESS,
                    payload: null
                });
            })
            .catch((error) => {
                dispatch({
                    type: SEND_FEEDBACK_ERROR,
                    payload: {error}
                });
            });
    }
}


