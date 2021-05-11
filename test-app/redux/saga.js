import {all} from 'redux-saga/effects'
import {saga as authSaga} from 'tt-ducks/auth'
import {saga as taskSaga} from 'tt-ducks/task'
import {saga as tasksSaga} from 'tt-ducks/tasks'
import {saga as processTaskSaga} from 'tt-ducks/process-task'
import {saga as processSaga} from 'tt-ducks/process'
import {saga as processesSaga} from 'tt-ducks/processes'
import {saga as routeSaga} from 'tt-ducks/route'
import {saga as usersDictionarySaga} from 'tt-ducks/users-dictionary'
import {saga as componentsDictionarySaga} from 'tt-ducks/components-dictionary'
import {saga as dictionarySaga} from 'tt-ducks/dictionary'

export default function* rootSaga() {
    yield all([
        authSaga(),
        taskSaga(),
        tasksSaga(),
        processTaskSaga(),
        processSaga(),
        processesSaga(),
        routeSaga(),
        usersDictionarySaga(),
        dictionarySaga(),
        componentsDictionarySaga()
    ])
}
