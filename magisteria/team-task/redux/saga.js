import {all} from 'redux-saga/effects'
import {saga as appSaga} from 'tt-ducks/app'
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
import {saga as notificationsSaga} from 'tt-ducks/notifications'
import {saga as timelinesSaga} from 'tt-ducks/timelines'
import {saga as eventsSaga} from 'tt-ducks/events-timeline'
import {saga as periodsSaga} from 'tt-ducks/periods-timeline'
import {saga as dashboardRecordsSaga} from 'tt-ducks/dashboard-records'
import {saga as scriptCommandsTimelineSaga} from 'tt-ducks/script-commands-timeline'
import {saga as accessRightsSaga} from 'tt-ducks/access-rights-dictionary'

export default function* rootSaga() {
    yield all([
        appSaga(),
        authSaga(),
        taskSaga(),
        tasksSaga(),
        processTaskSaga(),
        processSaga(),
        processesSaga(),
        routeSaga(),
        usersDictionarySaga(),
        dictionarySaga(),
        componentsDictionarySaga(),
        notificationsSaga(),
        timelinesSaga(),
        eventsSaga(),
        periodsSaga(),
        dashboardRecordsSaga(),
        scriptCommandsTimelineSaga(),
        accessRightsSaga()
    ])
}
