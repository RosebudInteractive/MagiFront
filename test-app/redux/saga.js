import {all} from 'redux-saga/effects'
import {saga as appSaga} from 'ducks/app'
import {saga as testSaga} from "ducks/test";
import {saga as testInstanceSaga} from "ducks/test-instance";
import {saga as testResultSaga} from "ducks/test-result";


export default function* rootSaga() {
    yield all([
        appSaga(),
        testSaga(),
        testInstanceSaga(),
        testResultSaga(),
    ])
}
