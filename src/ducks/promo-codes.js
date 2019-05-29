import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
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

export const CREATE_NEW_PROMO_REQUEST = `${prefix}/CREATE_NEW_PROMO_REQUEST`
export const EDIT_CURRENT_PROMO_REQUEST = `${prefix}/EDIT_CURRENT_PROMO_REQUEST`

export const SHOW_EDITOR = `${prefix}/SHOW_EDITOR`
export const CLOSE_EDITOR = `${prefix}/CLOSE_EDITOR`

/**
 * Reducer
 * */
const ReducerRecord = Record({
    loading: false,
    loaded: false,
    showEditor: false,
    editMode: true,
    selected: null,
    hasChanges: false,
    entries: new OrderedMap([])
})

const PromoRecord = Record({
    Code: null,
    Perc: null,
    Counter: 0,
    FirstDate: null,
    LastDate: null,
    Products: [],
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

        case GET_PROMO_CODES_FAIL: {
            return state
                .set('loaded', false)
                .set('loading', false)
        }

        case SHOW_EDITOR:
            return state.set('showEditor', true)

        case CLOSE_EDITOR:
            return state.set('showEditor', false)



        default:
            return state
    }
}


/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)

const entriesSelector = createSelector(stateSelector, state => state.entries)
export const promosSelector = createSelector(entriesSelector, (entries) => {
    let _array = entries.toArray();

    return _array.map((item) => {
        let _item = item.toObject()

        _item.id = _item.Id
        return _item
    })
})
export const showEditorSelector = createSelector(stateSelector, state => state.showEditor)

/**
 * Action Creators
 * */
export const getPromoCodes = () => {
    return {type : GET_PROMO_CODES_REQUEST}
}

export const createPromo = () => {
    return { type : CREATE_NEW_PROMO_REQUEST }
}

export const editCurrentPromo = (id) => {
    return {type: EDIT_CURRENT_PROMO_REQUEST, payload: id}
}

export const closeEditor = () => {
    return {type: CLOSE_EDITOR}
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

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _fetchPromoCodes = () => {
    return fetch("/api/adm/promo-codes", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* createPromoCodeSaga(){
    yield put(replace('/adm/promos/new'))

    yield put({type: SHOW_EDITOR})
}

export const saga = function* () {
    yield all([
        takeEvery(GET_PROMO_CODES_REQUEST, getPromoCodesSaga),
        takeEvery(CREATE_NEW_PROMO_REQUEST, createPromoCodeSaga),
    ])
}

const dataToEntries = (values, DataRecord) => {
    return Object.values(values)
        .reduce(
            (acc, value) => acc.set(value.Id, new DataRecord(value)),
            new OrderedMap({})
        )
}
