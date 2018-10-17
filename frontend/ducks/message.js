import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";

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

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    showFeedbackWindow: false,
    showFeedbackResultMessage: false,
    fetching: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case SEND_FEEDBACK_START:
            return state
                .set('error', null)
                .set('fetching', true)

        case SEND_FEEDBACK_SUCCESS:
            return state
                .set('fetching', false)
                .set('showFeedbackWindow', false)
                .set('showFeedbackResultMessage', true)

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
export const showFeedbackWindowSelector = createSelector(stateSelector, state => state.showFeedbackWindow)
// export const loadingSelector = createSelector(stateSelector, state => state.loading)

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