import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'

/**
 * Constants
 * */
export const moduleName = 'messages';
const prefix = `${appName}/${moduleName}`;

//action types
const SHOW_ERROR = `${prefix}/SHOW_ERROR`;
const SHOW_INFO = `${prefix}/SHOW_INFO`;
const SHOW_WARNING = `${prefix}/SHOW_WARNING`;
const SHOW_USER_CONFIRMATION = `${prefix}/SHOW_USER_CONFIRMATION`;
const TOGGLE_MESSAGE_VISIBILITY = `${prefix}/TOGGLE_MESSAGE_VISIBILITY`;

//Message types:
export const INFO = 'info',
    ERROR = 'error',
    WARNING = 'warning',
    CONFIRMATION = 'confirmation';



export const ReducerRecord = Record({
    visible: false,
    type: INFO,
    content: 'Вы увидели это сообщение, потому что что-то произошло',
    title: 'Упс! похоже что-то случилось'
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SHOW_INFO:
        case SHOW_ERROR:
        case SHOW_WARNING:
        case SHOW_USER_CONFIRMATION:
            return state
                .set('visible', true)
                .set('type', payload.type)
                .set('content', payload.content)
                .set('title', payload.title);
        case TOGGLE_MESSAGE_VISIBILITY:
            return state.set('visible', payload);
        default:
            return state;
    }
}

/**
 * Action Creators
 * */

export const showInfo = (message) => {
    return {type: SHOW_INFO, payload: message}
};

export const showError = (message) => {
    return {type: SHOW_ERROR, payload: message}
};

export const showWarning = (message) => {
    return {type: SHOW_WARNING, payload: message}
};

export const showUserConfirmation = (message) => {
    return {type: SHOW_USER_CONFIRMATION, payload: message}
};

//visible: boolean
export const toggleMessage = (visible) => {
    return {type: TOGGLE_MESSAGE_VISIBILITY, payload: visible}
};


/**
 * Selectors
 * */
const stateSelector = state => state[moduleName];
export const messageSelector = createSelector(stateSelector, state => state);
