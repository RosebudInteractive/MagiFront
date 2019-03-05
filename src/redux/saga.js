import {all} from 'redux-saga/effects'
import {saga as booksSaga} from '../ducks/books'
// import {saga as peopleSaga} from '../ducks/people'
// import {saga as eventsSaga} from '../ducks/events'

export default function* rootSaga() {
    yield all([
        booksSaga(),
        // peopleSaga(),
        // eventsSaga()
    ])
}