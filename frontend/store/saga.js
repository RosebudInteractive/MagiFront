import {all} from 'redux-saga/effects'
import {saga as profileSaga} from 'ducks/profile'
import {saga as billingSaga} from 'ducks/billing'
import {saga as appSaga} from 'ducks/app'
import {saga as playerSaga} from 'ducks/player'
import {saga as googleAnalyticsSaga} from 'ducks/google-analytics'
import {saga as testSaga} from 'ducks/test'
import {saga as testInstanceSaga} from 'ducks/test-instance'
import {saga as testResultSaga} from 'ducks/test-result'
import {saga as testShareResultSaga} from 'ducks/test-share-result'
import {saga as filtersSaga} from 'ducks/filters'
// пока костыль
import {saga as courseSaga} from 'ducks/course'
import {saga as lessonMenuSaga} from 'ducks/lesson-menu'
import {saga as messagesSaga} from 'ducks/message'

export default function* rootSaga() {
    yield all([
        profileSaga(),
        billingSaga(),
        appSaga(),
        playerSaga(),
        googleAnalyticsSaga(),
        testSaga(),
        testInstanceSaga(),
        testResultSaga(),
        testShareResultSaga(),
        courseSaga(),
        lessonMenuSaga(),
        filtersSaga(),
        messagesSaga(),
    ])
}