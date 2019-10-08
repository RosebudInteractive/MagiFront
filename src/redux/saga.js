import {all} from 'redux-saga/effects'
import {saga as booksSaga} from '../ducks/books'
import {saga as promosSaga} from '../ducks/promo-codes'
import {saga as productsSaga} from '../ducks/products'
import {saga as testListSaga} from '../ducks/test-list'
import {saga as singleTestSaga} from '../ducks/single-test'
import {saga as courseSaga} from '../ducks/course'

export default function* rootSaga() {
    yield all([
        booksSaga(),
        promosSaga(),
        productsSaga(),
        testListSaga(),
        singleTestSaga(),
        courseSaga(),
    ])
}