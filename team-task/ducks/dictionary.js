import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {hasSupervisorRights} from "tt-ducks/auth";
import {SHOW_ERROR} from "tt-ducks/messages";
import {commonGetQuery} from "common-tools/fetch-tools";
import {showError} from "tt-ducks/messages";
import moment from 'moment';




//todo processStructures after request-query completed

/**
 * Constants
 * */
export const moduleName = 'dictionary';
const prefix = `${appName}/${moduleName}`;

//action types

export const LOAD_ALL = `${prefix}/LOAD_ALL`;
const LOAD_LESSONS = `${prefix}/LOAD_LESSONS`;
const LOAD_USERS = `${prefix}/LOAD_USERS`;

export const REQUEST_START = `${prefix}/REQUEST_START`;
export const REQUEST_SUCCESS = `${prefix}/REQUEST_SUCCESS`;
export const REQUEST_FAIL = `${prefix}/REQUEST_FAIL`;
export const REQUEST_FAIL_WITH_ERROR = `${prefix}/REQUEST_FAIL_WITH_ERROR`;
export const TOGGLE_FETCHING = `${prefix}/TOGGLE_FETCHING`;



const SET_NEXT_TIME_TO_LOAD = `${prefix}/SET_NEXT_TIME_TO_LOAD`;
const SET_ALL_DATA = `${prefix}/SET_ALL_DATA`;
const SET_USERS = `${prefix}/SET_USERS`;
const SET_LESSONS = `${prefix}/SET_LESSONS`;

const DATA_LIFETIME = (60 * 1); //  1 minute


//store

export const UsersRecord = Record({
    a: [],
    pma: [],
    pms: [],
    pme: [],
    pmu: []
});

export const ReducerRecord = Record({
    lessons: [],
    availableForCreationLessons: [],
    users: new UsersRecord(),
    processStructures: [],
    nextTimeToLoadData: 0,
    fetching: false
});



//reducer

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_ALL_DATA:
            return state
                .setIn(['users', 'a'], payload.a)
                .setIn(['users', 'pma'], payload.pma)
                .setIn(['users', 'pms'], payload.pms)
                .setIn(['users', 'pme'], payload.pme)
                .setIn(['users', 'pmu'], payload.pmu)
                .set('lessons', payload.lessons)
                .set('availableForCreationLessons', payload.availableForCreationLessons)
        case SET_NEXT_TIME_TO_LOAD:
            return state.set('nextTimeToLoadData', payload);
        case SET_LESSONS:
            return state.set('lessons', payload);
        case SET_USERS:
            return state
                .setIn(['users', 'a'], payload.a)
                .setIn(['users', 'pma'], payload.pma)
                .setIn(['users', 'pms'], payload.pms)
                .setIn(['users', 'pme'], payload.pme)
                .setIn(['users', 'pmu'], payload.pmu);
        case TOGGLE_FETCHING:
            return state.set('fetching', payload);

        default:
            return state;
    }
}


//selectors

const stateSelector = state => state[moduleName];
export const nextTimeSelector = createSelector(stateSelector, state => state.nextTimeToLoadData);
export const dictionaryFetching = createSelector(stateSelector, state => state.fetching);
export const lessonsSelector = createSelector(stateSelector, state => state.lessons);
export const availableForCreationLessons = createSelector(stateSelector, state => state.availableForCreationLessons);
export const userWithSupervisorRightsSelector = createSelector(stateSelector, (state) => {
    return [...state.users.a, state.users.pma, state.users.pms]
});

// actions
//forceLoad: boolean
export const getAllDictionaryData = (forceLoad = false) => {
    return {type: LOAD_ALL, payload: {forceLoad}}
};

export const getAllUsers = (forceLoad = false) => {
    return {type: LOAD_USERS, payload: {forceLoad}}
};

export const getAllLessons = (forceLoad = false) => {
    return {type: LOAD_LESSONS, payload: {forceLoad}}
};

const setAllData = (data) => {
    return {type: SET_ALL_DATA, payload: data}
};

export const toggleFetching = (isOn) => {
    return {type: TOGGLE_FETCHING, payload: isOn}
};


//sagas:

export const saga = function* () {
    yield all([
        takeEvery(LOAD_ALL, getDictionaryDataSaga),
        takeEvery(LOAD_LESSONS, getLessonsDataSaga),
        takeEvery(LOAD_USERS, getUsersDataSaga),
        takeEvery(REQUEST_FAIL_WITH_ERROR, showErrorMessage),
        takeEvery(REQUEST_START, fetchingToggle),
        takeEvery(REQUEST_SUCCESS, fetchingToggle),
        takeEvery(REQUEST_FAIL, fetchingToggle),
    ])
}

function* fetchingToggle(isOn){
    try {
        yield put(toggleFetching(isOn.payload))
    } catch (e) {
        yield put(showError({content: 'toggle fetching error'}))
    }
}

function* getDictionaryDataSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights); //todo return this after it loaded before
    const _nextTimeToLoad = yield select(nextTimeSelector);
    if (!_hasSupervisorRights) return;

    if ((_nextTimeToLoad === 0 || (_nextTimeToLoad <= moment(Date.now()))) || data.payload.forceLoad) {
        try {
            yield put({type: REQUEST_START, payload: true});
            const [
                _a,
                _pma,
                _pms,
                _pme,
                _pmu,
                _lessons,
                _availableForCreationLessons
            ] = yield all([
                call(_getAUsers),
                call(_getPmaUsers),
                call(_getPmsUsers),
                call(_getPmeUsers),
                call(_getPmuUsers),
                call(_getLessons),
                call(_getAvailableForCreationLessons),
            ]);

            if(_a && _pma && _pms && _pme && _pmu && _lessons){
                yield put({type: REQUEST_SUCCESS, payload: false});
                yield put({
                    type: SET_ALL_DATA,
                    payload: {
                        a: _a,
                        pma: _pma,
                        pms: _pms,
                        pme: _pme,
                        pmu: _pmu,
                        lessons: _lessons,
                        availableForCreationLessons: _availableForCreationLessons
                    }
                });

                const nowTime = moment(Date.now());
                const nextTime = nowTime.add(DATA_LIFETIME, 'seconds');
                yield put({type: SET_NEXT_TIME_TO_LOAD, payload: nextTime});
            } else {
                yield put({type: REQUEST_FAIL, payload: false})
            }
        } catch (e) {
            yield put({type: REQUEST_FAIL_WITH_ERROR, payload: {content: e. message}});
        }

    } else {
        return;
    }
}


function* showErrorMessage(data) {
    yield put(showError({content: data.payload.content, title: 'Error'}));
    yield put(fetchingToggle(false));
}

function* getUsersDataSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights);
    const _nextDataToLoad = yield select(nextTimeSelector);

    if (!_hasSupervisorRights) return;
    if ((_nextDataToLoad === 0 || (_nextDataToLoad <= moment(Date.now()))) || data.payload.forceLoad) {
        try {
            yield put({type: REQUEST_START, payload: true});
            const [
                _a,
                _pma,
                _pms,
                _pme,
                _pmu
            ] = yield all([
                call(_getAUsers),
                call(_getPmaUsers),
                call(_getPmsUsers),
                call(_getPmeUsers),
                call(_getPmuUsers),
            ]);

            if(_a && _pma && _pms && _pme && _pmu){
                yield put({action: REQUEST_SUCCESS, payload: false});

                yield put({
                    type: SET_USERS,
                    payload: {
                        a: _a,
                        pma: _pma,
                        pms: _pms,
                        pme: _pme,
                        pmu: _pmu,
                    }
                });

                const nowTime = moment(Date.now());
                const nextTime = nowTime.add(DATA_LIFETIME, 'seconds');
                yield put({type: SET_NEXT_TIME_TO_LOAD, payload: nextTime});
            } else {
                yield put({type: REQUEST_FAIL, payload: false})
            }


        } catch (e) {
            yield put({type: REQUEST_FAIL_WITH_ERROR, payload: {content: e. message}});
        }

    } else {
        return;
    }
}

function* getLessonsDataSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights);
    const _nextDataToLoad = yield select(nextTimeSelector);

    if (!_hasSupervisorRights) return;
    if ((_nextDataToLoad === 0 || (_nextDataToLoad <= moment(Date.now()))) || data.payload.forceLoad) {
        try {
            yield put({type: REQUEST_START, payload: true});
            const _lessons = yield call(_getLessons);

            if(_lessons){
                yield put({type: REQUEST_SUCCESS, payload: false});
                yield put({type: SET_LESSONS, payload: _lessons});

                const nowTime = moment(Date.now());
                const nextTime = nowTime.add(DATA_LIFETIME, 'seconds');
                yield put({type: SET_NEXT_TIME_TO_LOAD, payload: nextTime});
            } else {
                yield put({type: REQUEST_FAIL, payload: false})
            }


        } catch (e) {
            yield put({type: REQUEST_FAIL_WITH_ERROR, payload: {content: e. message}});
        }

    } else {
        return;
    }
}


//fetchers

const _getAllUsers = () => {
    return commonGetQuery("/api/users/list?role=a,pma,pms,pmu,pme");
};

// const _processStructures = () => { //todo add request after request-query completed
// };

const _getLessons = () => {
    return commonGetQuery("/api/lessons-list")
};

const _getAvailableForCreationLessons = () => {
    return commonGetQuery("/api/lessons-list?woProc=true&draft=true&order=Lesson")
};

const _getAUsers = () => {
    return commonGetQuery("/api/users/list?role=a");
};

const _getPmaUsers = () => {
    return commonGetQuery("/api/users/list?role=pma");
};

const _getPmsUsers = () => {
    return commonGetQuery("/api/users/list?role=pms");
};

const _getPmuUsers = () => {
    return commonGetQuery("/api/users/list?role=pmu");
};

const _getPmeUsers = () => {
    return commonGetQuery("/api/users/list?role=pme");
};


