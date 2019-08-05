import {appName} from '../config'
import {createSelector} from 'reselect'
import { takeEvery, take, put, race, all } from 'redux-saga/effects';
import {Record} from "immutable";

export const moduleName = 'messages'
const prefix = `${appName}/${moduleName}`

export const CONFIRM_RESULT = `${prefix}/CONFIRM_RESULT`
export const CANCEL_RESULT = `${prefix}/CANCEL_RESULT`

const SHOW_USER_CONFIRMATION = `${prefix}/SHOW_USER_CONFIRMATION`
const CLOSE_USER_CONFIRMATION = `${prefix}/CLOSE_USER_CONFIRMATION`

const CONFIRM_CLOSE_EDITOR_MESSAGE = 'Есть несохраненные данные.\n Перейти без сохранения?'

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    userConfirmationVisible : false,
    message: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case SHOW_USER_CONFIRMATION:
            return state
                .set('message', payload)
                .set('userConfirmationVisible', true)

        case CLOSE_USER_CONFIRMATION:
            return state
                .set('message', null)
                .set('userConfirmationVisible', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */
export const stateSelector = state => state[moduleName]
export const userConfirmationVisibleSelector = createSelector(stateSelector, state => state.userConfirmationVisible)
export const messageSelector = createSelector(stateSelector, state => state.message)


/**
 * Action Creators
 * */
export const confirm = () => {
    return {type: CONFIRM_RESULT}
}

export const cancel = () => {
    return {type: CANCEL_RESULT}
}

const showConfirmation = (message) => {
    return {type: SHOW_USER_CONFIRMATION, payload: message}
}

const hideConfirmation = () => {
    return {type: CLOSE_USER_CONFIRMATION}
}


export function* confirmCloseEditorSaga() {

    yield put(showConfirmation(CONFIRM_CLOSE_EDITOR_MESSAGE));

    const {yes} = yield race({
        yes: take(CONFIRM_RESULT),
        no: take(CANCEL_RESULT)
    })

    yield put(hideConfirmation());

    return !!yes;
}

// export const saga = function* () {
//     yield all([
//         takeEvery(CONFIRM_CLOSE_EDITOR, confirmSaga)
//     ])
// }