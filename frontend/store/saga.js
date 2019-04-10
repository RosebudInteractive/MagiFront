import {all} from 'redux-saga/effects'
import {saga as profileSaga} from 'ducks/profile'
import {saga as billingSaga} from 'ducks/billing'
import {saga as appSaga} from 'ducks/app'

export default function* rootSaga() {
    yield all([
        profileSaga(),
        billingSaga(),
        appSaga(),
    ])
}