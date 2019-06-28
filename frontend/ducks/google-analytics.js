import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, OrderedMap} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {all, takeEvery, put, call, select, fork,} from 'redux-saga/effects'
import {OrderedMap} from "../../_node_modules/immutable/dist/immutable";
import {BookRecord} from "adm-ducks/books";
import {GET_PAID_COURSE_INFO_REQUEST} from "ducks/billing";

/**
 * Constants
 * */
export const moduleName = 'google-analytics'
const prefix = `${appName}/${moduleName}`

const COURSES_PAGE_SHOWED = 'COURSES_PAGE_SHOWED'
const LESSON_PAGE_SHOWED = 'LECTURE_PAGE_SHOWED'
const LESSON_LINK_CLICKED = 'LESSON_LINK_CLICKED'
const CONCRETE_COURSE_PAGE_SHOWED = 'CONCRETE_COURSE_PAGE_SHOWED'
const CONCRETE_COURSE_LINK_CLICKED = 'CONCRETE_COURSE_LINK_CLICKED'

export const GET_NON_REGISTER_TRANSACTION_REQUEST = 'GET_NON_REGISTER_TRANSACTION_REQUEST'
export const GET_NON_REGISTER_TRANSACTION_START = 'GET_NON_REGISTER_TRANSACTION_START'
export const GET_NON_REGISTER_TRANSACTION_SUCCESS = 'GET_NON_REGISTER_TRANSACTION_SUCCESS'
export const GET_NON_REGISTER_TRANSACTION_FAIL = 'GET_NON_REGISTER_TRANSACTION_FAIL'

export const SET_TRANSACTION_REGISTERED_REQUEST = 'SET_TRANSACTION_REGISTERED_REQUEST'
export const SET_TRANSACTION_REGISTERED_START = 'SET_TRANSACTION_REGISTERED_START'
export const SET_TRANSACTION_REGISTERED_SUCCESS = 'SET_TRANSACTION_REGISTERED_SUCCESS'
export const SET_TRANSACTION_REGISTERED_FAIL = 'SET_TRANSACTION_REGISTERED_FAIL'

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    entries: new OrderedMap([])
})

const TransactionRecord = new Record({
    id: null,
    currencyCode: "RUB",
    revenue: 0,
    tax: 0,
    coupon: null,
    products: []
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_NON_REGISTER_TRANSACTION_START:
            return state
                .set('fetching', true)
                .update('entries', entries => entries.clear())

        case GET_NON_REGISTER_TRANSACTION_SUCCESS:
            return state
                .set('fetching', false)
                .set('entries', dataToEntries(payload, TransactionRecord))

        case GET_NON_REGISTER_TRANSACTION_FAIL:
            return state
                .set('fetching', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */
export const stateSelector = state => state[moduleName]
const transactions = createSelector(stateSelector, state => state.entries)


/**
 * Action Creators
 * */
export const getNonRegisterTransaction = () => {
    return { type: GET_NON_REGISTER_TRANSACTION_REQUEST }
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_NON_REGISTER_TRANSACTION_REQUEST, getNonRegisterTransactionSaga),
        takeEvery(SET_TRANSACTION_REGISTERED_REQUEST, registerTransactionsSaga),
    ])
}

function* getNonRegisterTransactionSaga() {
    yield put({type: GET_NON_REGISTER_TRANSACTION_START})

    try {
        let _data = yield call(_fetchNonRegisterTransactions)
        yield put({type: GET_NON_REGISTER_TRANSACTION_SUCCESS, payload: _data})
        yield put({type: SET_TRANSACTION_REGISTERED_REQUEST})
    } catch (error) {
        yield put({type: GET_NON_REGISTER_TRANSACTION_FAIL})
    }
}

const _fetchNonRegisterTransactions = () => {
    return fetch('/api/users/not-sent-trans', {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* registerTransactionsSaga() {
    const _transactions = yield select(transactions)

    let _result = _registerTransactions(_transactions)

    yield put({type: SET_TRANSACTION_REGISTERED_START})
    try {
        if (_result.length > 0) {
            yield call(_fetchSetRegisterTransactions, _result)
        }
        yield put({type: SET_TRANSACTION_REGISTERED_SUCCESS})
    } catch (error) {
        yield put({type: SET_TRANSACTION_REGISTERED_FAIL})
    }
}

const _registerTransactions = (data) => {
    let _result = []

    if (window.dataLayer) {
        data.forEach((item) => {
            _result.push(item.id)
            window.dataLayer.push({
                'ecommerce': {
                    'currencyCode': 'RUB',
                    'purchase': {
                        'actionField': {
                            'id': item.id,     //'id заказа',
                            'revenue': item.revenue, // '91.4', //полная сумма транзакции
                            'tax': '9.4', //сумма всех налогов транзакции
                            'coupon': 'Coupon 1' //промокод, использовавшийся при оформлении заказа
                        },
                        'products': [{
                            'name': 'Название курса',
                            'id': 'ID1',
                            'price': '91.4',
                            'brand': 'Имя автора',
                            'category': 'Категория курса',
                            'quantity': 1
                        }]

                    },
                    'event': 'gtm-ee-event',
                    'gtm-ee-event-category': 'Enhanced Ecommerce',
                    'gtm-ee-event-action': 'Purchase',
                    'gtm-ee-event-non-interaction': 'False',
                }
            })
        })
    }

    return _result
}

const _fetchSetRegisterTransactions = (values) => {
    return fetch('/api/users/send-trans', {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(values),
        credentials: 'include',
        redirect: 'manual'
    })
        .then(checkStatus)
        .then(parseJSON)
}


const dataToEntries = (values, DataRecord) => {
    return Object.values(values)
        .reduce(
            (acc, value) => acc.set(value.Id, new DataRecord(value)),
            new OrderedMap({})
        )
}




