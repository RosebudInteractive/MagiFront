import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record,} from 'immutable'
import {all, takeEvery, put, select} from "@redux-saga/core/effects";
import type {GridSortOrder} from "../types/grid";
import {GRID_SORT_DIRECTION} from "../constants/common";
import {push} from "react-router-redux/src";
import $ from "jquery";
import {GET_TASKS_FAIL, GET_TASKS_SUCCESS} from "tt-ducks/tasks";
import {GET_PROCESSES_FAIL, GET_PROCESSES_SUCCESS} from "tt-ducks/processes";
/**
 * Constants
 * */
export const moduleName = 'app'
const prefix = `${appName}/${moduleName}`

const HIDE_SIDE_BAR_MENU = `${prefix}/HIDE_SIDE_BAR_MENU`
const SHOW_SIDE_BAR_MENU = `${prefix}/SHOW_SIDE_BAR_MENU`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    sideBarMenuVisible: true
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case HIDE_SIDE_BAR_MENU:
            return state
                .set("sideBarMenuVisible", false)
        case SHOW_SIDE_BAR_MENU:
            return state
                .set("sideBarMenuVisible", true)

        default:
            return state
    }
}

/**
 * Selectors
 * */

const stateSelector = state => state[moduleName]
export const sideBarMenuVisible = createSelector(stateSelector, state => state.sideBarMenuVisible)

/**
 * Action Creators
 * */
export const hideSideBarMenu = () => {
    return {type: HIDE_SIDE_BAR_MENU}
}

export const showSideBarMenu = () => {
    return {type: SHOW_SIDE_BAR_MENU}
}



