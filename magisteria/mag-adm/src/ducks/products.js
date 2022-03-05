import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {all, takeEvery, select, take, put, apply, call} from 'redux-saga/effects'
import {SHOW_ERROR_DIALOG} from "../constants/Common";

/**
 * Constants
 * */
export const moduleName = 'products'
const prefix = `${appName}/${moduleName}`

export const GET_PRODUCTS_REQUEST = `${prefix}/GET_PRODUCTS_REQUEST`
export const GET_PRODUCTS_START = `${prefix}/GET_PRODUCTS_START`
export const GET_PRODUCTS_SUCCESS = `${prefix}/GET_PRODUCTS_SUCCESS`
export const GET_PRODUCTS_FAIL = `${prefix}/GET_PRODUCTS_FAIL`

/**
 * Reducer
 * */
const ReducerRecord = Record({
    loading: false,
    loaded: false,
    entries: new OrderedMap([])
})

const Product = Record({
    Id: null,
    Code: null,
    Name: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {

        case GET_PRODUCTS_START: {
            return state
                .set('loaded', false)
                .set('loading', true)
        }

        case GET_PRODUCTS_SUCCESS: {
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, Product))
        }

        case GET_PRODUCTS_FAIL: {
            return state
                .set('loaded', false)
                .set('loading', false)
        }

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
export const productsSelector = createSelector(entriesSelector, (entries) => {
    let _array = entries.toArray();

    return _array.map((item) => {
        let _item = item.toObject()

        _item.id = _item.Id
        return _item
    })
})

/**
 * Action Creators
 * */
export const getProducts = () => {
    return {type : GET_PRODUCTS_REQUEST}
}


/**
 * Sagas
 */
function* getProductsSaga() {
    yield put({type: GET_PRODUCTS_START})

    try {
        const _promos = yield call(_fetchProducts)

        yield put( {type: GET_PRODUCTS_SUCCESS, payload: _promos} )
    } catch (e) {
        yield put({ type: GET_PRODUCTS_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _fetchProducts = () => {
    return fetch("/api/products?TypeCode=COURSEONLINE&Detail=true&Discontinued=0", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}


export const saga = function* () {
    yield all([
        takeEvery(GET_PRODUCTS_REQUEST, getProductsSaga),
    ])
}

const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new OrderedMap({})
    )
}