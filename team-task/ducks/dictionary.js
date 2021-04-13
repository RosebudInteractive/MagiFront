import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {hasSupervisorRights} from "tt-ducks/auth";
import {showErrorMessage} from "tt-ducks/messages";
import {commonGetQuery} from "common-tools/fetch-tools";


//todo processStructures after request-query completed

/**
 * Constants
 * */
export const moduleName = 'dictionary';
const prefix = `${appName}/${moduleName}`;

//action types

const LOAD_ALL = `${prefix}/LOAD_ALL`;
const LOAD_LESSONS = `${prefix}/LOAD_LESSONS`;
const LOAD_USERS = `${prefix}/LOAD_USERS`;


const SET_NEXT_TIME_TO_LOAD = `${prefix}/SET_NEXT_TIME_TO_LOAD`;
const SET_ALL_DATA = `${prefix}/SET_ALL_DATA`;
const SET_USERS = `${prefix}/SET_USERS`;
const SET_LESSONS = `${prefix}/SET_LESSONS`;

const DATA_LIFETIME = 1000 * (60 * 1); // 1000ms with minutes multiplier, 1 minute


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
    users: new UsersRecord(),
    processStructures: [],
    nextTimeToLoadData: 0
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
                // .set('users', payload.users) // simple case
                .set('lessons', payload.lessons);
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
        default:
            return state;
    }
}


//selectors

const stateSelector = state => state[moduleName];
export const nextTimeSelector = createSelector(stateSelector, state => state.nextTimeToLoadData);

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


//sagas:

export const saga = function* () {
    yield all([
        takeEvery(LOAD_ALL, getDictionaryDataSaga),
        takeEvery(LOAD_LESSONS, getLessonsDataSaga),
        // takeEvery(LOAD_PROCESS_STRUCTURES, deleteElementSaga),
        takeEvery(LOAD_USERS, getUsersDataSaga),
    ])
}

function* getDictionaryDataSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights); //todo return this after it loaded before
    const _nextTimeToLoad = yield select(nextTimeSelector);

    if (!_hasSupervisorRights) return;

    if ((_nextTimeToLoad === 0 || (_nextTimeToLoad <= Date.now())) || data.payload.forceLoad) {
        try {
            const [
                _a,
                _pma,
                _pms,
                _pme,
                _pmu,
                _lessons
            ] = yield all([
                call(_getAUsers),
                call(_getPmaUsers),
                call(_getPmsUsers),
                call(_getPmeUsers),
                call(_getPmuUsers),
                call(_getLessons),
            ]);

            yield put({
                type: SET_ALL_DATA,
                payload: {
                    a: _a,
                    pma: _pma,
                    pms: _pms,
                    pme: _pme,
                    pmu: _pmu,
                    lessons: _lessons
                }
            });


            //simple case:
            // const [_allUsers, _lessons] = yield all([
            //     call(_getAllUsers),
            //     call(_getLessons),
            // ]);
            //
            // yield put({
            //     type: SET_ALL_DATA,
            //     payload: {
            //         users: _allUsers,
            //         lessons: _lessons}});
            yield put({type: SET_NEXT_TIME_TO_LOAD, payload: new Date(new Date(Date.now()).getTime() + DATA_LIFETIME)});
        } catch (e) {
            yield put(showErrorMessage(e.message))
        }

    } else {
        return;
    }
}

function* getUsersDataSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights);
    const _nextDataToLoad = yield select(nextTimeSelector);

    if (!_hasSupervisorRights) return;
    if ((_nextDataToLoad === 0 || (_nextDataToLoad <= Date.now())) || data.payload.forceLoad) {
        try {
            const [
                _a,
                _pma,
                _pms,
                _pme,
                _pmu,
                _lessons
            ] = yield all([
                call(_getAUsers),
                call(_getPmaUsers),
                call(_getPmsUsers),
                call(_getPmeUsers),
                call(_getPmuUsers),
                call(_getLessons),
            ]);

            yield put({
                type: SET_USERS,
                payload: {
                    a: _a,
                    pma: _pma,
                    pms: _pms,
                    pme: _pme,
                    pmu: _pmu,
                    lessons: _lessons
                }
            });

            //simple case
            // const _allUsers = yield call(_getAllUsers);
            //
            // yield put({type: SET_USERS, payload: _allUsers});
            yield put({type: SET_NEXT_TIME_TO_LOAD, payload: new Date(new Date(Date.now()).getTime() + DATA_LIFETIME)});
        } catch (e) {
            yield put(showErrorMessage(e.message))
        }

    } else {
        return;
    }
}

function* getLessonsDataSaga(data) {
    const _hasSupervisorRights = yield select(hasSupervisorRights);
    const _nextDataToLoad = yield select(nextTimeSelector);

    if (!_hasSupervisorRights) return;
    if ((_nextDataToLoad === 0 || (_nextDataToLoad <= Date.now())) || data.payload.forceLoad) {
        try {
            const _lessons = yield call(_getLessons);

            yield put({type: SET_LESSONS, payload: _lessons});
            yield put({type: SET_NEXT_TIME_TO_LOAD, payload: new Date(new Date(Date.now()).getTime() + DATA_LIFETIME)});
        } catch (e) {
            yield put(showErrorMessage(e.message))
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


