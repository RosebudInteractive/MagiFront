import {all} from 'redux-saga/effects'
import {saga as profileSaga} from 'ducks/profile'

export default function* rootSaga() {
    yield all([
        profileSaga(),
    ])
}