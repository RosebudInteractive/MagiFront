import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {reset,} from 'redux-form'
import {HIDE_DELETE_DLG, SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, select, take, put, apply, call} from 'redux-saga/effects'

/**
 * Constants
 * */
export const moduleName = 'promo-codes'
const prefix = `${appName}/${moduleName}`

export const GET_PROMO_CODES_REQUEST = `${prefix}/GET_PROMO_CODES_REQUEST`
export const GET_PROMO_CODES_START = `${prefix}/GET_PROMO_CODES_START`
export const GET_PROMO_CODES_SUCCESS = `${prefix}/GET_PROMO_CODES_SUCCESS`
export const GET_PROMO_CODES_FAIL = `${prefix}/GET_PROMO_CODES_FAIL`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    loading: false,
    loaded: false,
    showEditor: false,
    editMode: true,
    selected: null,
    hasChanges: false,
    entries: new OrderedMap([])
})

const PromoRecord = Record({

})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_PROMO_CODES_START: {
            return state
                .set('loaded', false)
                .set('loading', true)
        }

        case GET_PROMO_CODES_SUCCESS: {
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, PromoRecord))
        }



        default:
            return state
    }
}

/**
 * Action Creators
 * */
export const getPromoCodes = () => {
    return {type : GET_PROMO_CODES_START}
}


/**
 * Sagas
 */
function* getPromoCodesSaga() {
    yield put({type: GET_PROMO_CODES_START})

    try {
        const _promos = call(_fetchPromoCodes)

        yield put( {type: GET_PROMO_CODES_SUCCESS, payload: _promos} )
    } catch (e) {
        yield put({ type: GET_PROMO_CODES_FAIL, payload: {e} })
    }
}

const _fetchPromoCodes = () => {
    return fetch("/api/adm/promo-codes", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

export const saga = function* () {
    yield all([
        takeEvery(GET_PROMO_CODES_REQUEST, getPromoCodesSaga)
    ])
}

const dataToEntries = (values, DataRecord) => {
    return Object.values(values)
        .reduce(
            (acc, value) => acc.set(value.Id, new DataRecord(value)),
            new OrderedMap({})
        )
}
