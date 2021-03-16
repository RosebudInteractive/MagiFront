import {all} from 'redux-saga/effects'
import {saga as authSaga} from 'tt-ducks/auth'
import {saga as taskSaga} from 'tt-ducks/task'
import {saga as tasksSaga} from 'tt-ducks/tasks'
import {saga as processSaga} from 'tt-ducks/process'
import {saga as processesSaga} from 'tt-ducks/processes'
import {saga as routeSaga} from 'tt-ducks/route'

export default function* rootSaga() {
    yield all([
        authSaga(),
        taskSaga(),
        tasksSaga(),
        processSaga(),
        processesSaga(),
        routeSaga(),
        // testListSaga(),
        // singleTestSaga(),
        // courseSaga(),
        // reviewsSaga(),
        // searchSaga(),
        // transcriptSaga(),
    ])
}
