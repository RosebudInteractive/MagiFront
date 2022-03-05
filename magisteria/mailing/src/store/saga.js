import {all} from 'redux-saga/effects'
import {saga as courseSaga} from 'ducks/course'

export default function* rootSaga() {
    yield all([
        courseSaga(),
    ])
}