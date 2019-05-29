import {all} from 'redux-saga/effects'
import {saga as booksSaga} from '../ducks/books'
import {saga as promosSaga} from '../ducks/promo-codes'

export default function* rootSaga() {
    yield all([
        booksSaga(),
        promosSaga(),
    ])
}