import {all} from 'redux-saga/effects'
import {saga as profileSaga} from 'ducks/profile'
import {saga as billingSaga} from 'ducks/billing'

export default function* rootSaga() {
    yield all([
        profileSaga(),
        billingSaga(),
    ])
}