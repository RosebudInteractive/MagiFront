import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {reset} from "redux-form";

/**
 * Constants
 * */
export const moduleName = 'message'
const prefix = `${appName}/${moduleName}`

export const SHOW_FEEDBACK_WINDOW = `${prefix}/SHOW_FEEDBACK_WINDOW`
export const HIDE_FEEDBACK_WINDOW = `${prefix}/HIDE_FEEDBACK_WINDOW`
export const SHOW_FEEDBACK_RESULT_MESSAGE = `${prefix}/SHOW_FEEDBACK_RESULT_MESSAGE`
export const HIDE_FEEDBACK_RESULT_MESSAGE = `${prefix}/HIDE_FEEDBACK_RESULT_MESSAGE`
export const SEND_FEEDBACK_START = `${prefix}/SEND_FEEDBACK_START`
export const SEND_FEEDBACK_SUCCESS = `${prefix}/SEND_FEEDBACK_SUCCESS`
export const SEND_FEEDBACK_ERROR = `${prefix}/SEND_FEEDBACK_ERROR`
export const MAIL_SUBSCRIBE_START = `${prefix}/MAIL_SUBSCRIBE_START`
export const MAIL_SUBSCRIBE_SUCCESS = `${prefix}/MAIL_SUBSCRIBE_SUCCESS`
export const MAIL_SUBSCRIBE_ERROR = `${prefix}/MAIL_SUBSCRIBE_ERROR`

export const SHOW_MODAL_MESSAGE_ERROR = `${prefix}/SHOW_MODAL_MESSAGE_ERROR`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    showFeedbackWindow: false,
    showFeedbackResultMessage: false,
    fetching: false,
    successMessage: null,
    error: null,
    msgUrl: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case MAIL_SUBSCRIBE_START:
        case SEND_FEEDBACK_START:
            return state
                .set('error', null)
                .set('fetching', true)
                .set('msgUrl', null)

        case SEND_FEEDBACK_SUCCESS:
            return state
                .set('fetching', false)
                .set('showFeedbackWindow', false)
                .set('showFeedbackResultMessage', true)
                .set('msgUrl', (payload && payload.msgUrl) ? payload.msgUrl : null)

        case MAIL_SUBSCRIBE_SUCCESS:
            return state
                .set('fetching', false)
                // .set('showFeedbackWindow', false)
                // .set('showFeedbackResultMessage', true)
                // .set('successMessage', 'Подписка успешно добавлена')

        case MAIL_SUBSCRIBE_ERROR:
        case SEND_FEEDBACK_ERROR:
        case SHOW_MODAL_MESSAGE_ERROR:
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
export const showFeedbackWindowSelector = createSelector(stateSelector, state => state.showFeedbackWindow)
export const showFeedbackResultMessageSelector = createSelector(stateSelector, state => state.showFeedbackResultMessage)
export const errorMessageSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.fetching)
export const messageUrlSelector = createSelector(stateSelector, state => state.msgUrl)

/**
 * Action Creators
 * */
export const showModalErrorMessage = (error) => {
    return {type: SHOW_MODAL_MESSAGE_ERROR, payload: {error : error}}
}


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
            .then((data) => {
                dispatch({
                    type: SEND_FEEDBACK_SUCCESS,
                    payload: data
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

export const subscribe = (values) => {
    return (dispatch) => {
        dispatch({
            type: MAIL_SUBSCRIBE_START,
            payload: null
        });

        fetch('/api/mail-subscription', {
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
                    type: MAIL_SUBSCRIBE_SUCCESS,
                    payload: null
                });

                dispatch(reset('subscribe-form'));
            })
            .catch((error) => {
                dispatch({
                    type: MAIL_SUBSCRIBE_ERROR,
                    payload: {error}
                });
            });
    }
}

export const showFeedbackWindow = () => {
    return {
        type: SHOW_FEEDBACK_WINDOW,
        payload: null
    }
}

export const hideFeedbackWindow = () => {
    return {
        type: HIDE_FEEDBACK_WINDOW,
        payload: null
    }
}

export const showFeedbackResultMessage = () => {
    return {
        type: SHOW_FEEDBACK_RESULT_MESSAGE,
        payload: null
    }
}

export const hideFeedbackResultMessage = () => {
    return {
        type: HIDE_FEEDBACK_RESULT_MESSAGE,
        payload: null
    }
}