import {all} from 'redux-saga/effects'
import {saga as profileSaga} from 'ducks/profile'
import {saga as billingSaga} from 'ducks/billing'
import {saga as appSaga} from 'ducks/app'
import {saga as playerSaga} from 'ducks/player'
import {saga as googleAnalyticsSaga} from 'ducks/google-analytics'
import {saga as testSaga} from 'ducks/test'

export default function* rootSaga() {
    yield all([
        profileSaga(),
        billingSaga(),
        appSaga(),
        playerSaga(),
        googleAnalyticsSaga(),
        testSaga(),
    ])
}