import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'


/**
 * Constants
 * */
export const moduleName = 'player-screen'
const prefix = `${appName}/${moduleName}`

export const HIDE_SCREEN_CONTROLS = `${prefix}/HIDE_SCREEN_CONTROLS`
export const SHOW_SCREEN_CONTROLS = `${prefix}/SHOW_SCREEN_CONTROLS`
export const SET_FADE = `${prefix}/SET_FADE`
export const CLEAR_FADE = `${prefix}/CLEAR_FADE`
export const CLEAR_ALL = `${prefix}/CLEAR_ALL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    showScreenControls: false,
    fade: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type} = action

    switch (type) {
        case HIDE_SCREEN_CONTROLS:
            return state
                .set('showScreenControls', false)

        case SHOW_SCREEN_CONTROLS:
            return state
                .set('showScreenControls', true)

        case SET_FADE:
            return state
                .set('showScreenControls', false)
                .set('fade', true)

        case CLEAR_FADE:
            return state
                .set('showScreenControls', true)
                .set('fade', false)

        case CLEAR_ALL:
            return state
                .set('showScreenControls', true)
                .set('fade', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const showScreenControlsSelector = createSelector(stateSelector, state => state.showScreenControls)
export const fadeSelector = createSelector(stateSelector, state => state.fade)

/**
 * Action Creators
 * */

export function hideScreenControls() {
    return {
            type: HIDE_SCREEN_CONTROLS,
            payload: null
    }
}

export function showScreenControls() {
    return {
        type: SHOW_SCREEN_CONTROLS,
        payload: null
    }
}

export function setFade() {
    return {
        type: SET_FADE,
        payload: null
    }
}

export function clearFade() {
    return {
        type: CLEAR_FADE,
        payload: null
    }
}

export function clearAll() {
    return {
        type: CLEAR_ALL,
        payload: null
    }
}