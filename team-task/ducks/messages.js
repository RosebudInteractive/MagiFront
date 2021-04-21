import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {MESSAGE_TYPE} from "../constants/messages"
import type {Message} from "../types/messages";

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

export const MODAL_MESSAGE_ACCEPT = `${prefix}/MODAL_MESSAGE_ACCEPT`;
export const MODAL_MESSAGE_DECLINE = `${prefix}/MODAL_MESSAGE_DECLINE`;

const initialButtonsText = {
    confirmButtonText: 'Ок',
    declineButtonText: 'Отмена'
};

export const ReducerRecord = Record({
    visible: false,
    type: MESSAGE_TYPE.INFO,
    content: 'Вы увидели это сообщение, потому что что-то произошло',
    title: 'Упс! похоже что-то случилось',
    confirmButtonText: initialButtonsText.confirmButtonText,
    declineButtonText: initialButtonsText.declineButtonText
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SHOW_INFO:
        case SHOW_ERROR:
        case SHOW_WARNING:
        case SHOW_USER_CONFIRMATION:
            return state.merge({
                visible: true,
                confirmButtonText: payload.confirmButtonText ? payload.confirmButtonText : initialButtonsText.confirmButtonText,
                declineButtonText: payload.declineButtonText ? payload.declineButtonText : initialButtonsText.declineButtonText,
                ...payload
            });
        case TOGGLE_MESSAGE_VISIBILITY:
            return state.set('visible', payload);
        default:
            return state;
    }
}

/**
 * Action Creators
 * */

export const showErrorMessage = (message) => {
    return {type: SHOW_ERROR, payload: {content: message, type: MESSAGE_TYPE.ERROR}}
};

export const showInfo = (message) => {
    return {type: SHOW_INFO, payload: {type: MESSAGE_TYPE.INFO, ...message}}
};

export const showError = (message) => {
    return {type: SHOW_ERROR, payload: {type: MESSAGE_TYPE.ERROR, ...message}}
};

export const showWarning = (message) => {
    return {type: SHOW_WARNING, payload: {type: MESSAGE_TYPE.WARNING, ...message}}
};

export const showUserConfirmation = (message: Message) => {
    return {type: SHOW_USER_CONFIRMATION, payload: {type: MESSAGE_TYPE.CONFIRMATION, ...message}}
};

export const acceptAction = () => {
    return { type: MODAL_MESSAGE_ACCEPT }
};

export const declineAction = () => {
    return { type: MODAL_MESSAGE_DECLINE }
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
