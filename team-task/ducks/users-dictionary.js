import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {MESSAGE_TYPE} from "../constants/messages"
import type {Message} from "../types/messages";
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, takeEvery, put, call, select} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {USER_ROLE_STRINGS} from '../constants/dictionary-users'


//constants

export const moduleName = 'users-dictionary';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_USERS = `${prefix}/SET_USERS`;
const LOAD_USERS = `${prefix}/LOAD_USERS`;

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;
const TOGGLE_FETCHING = `${prefix}/TOGGLE_FETCHING`;

//store

const defaultExampleUsers = [
    {
        Id: 1,
        DisplayName: "User1",
        Email: 'some@email1.ru',
        Role: 'role'
    },
    {
        Id: 2,
        DisplayName: "User2",
        Email: 'some@email2.ru',
        Role: 'role2',
    }
]

export const ReducerRecord = Record({
    users: [],
    fetching: false
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_USERS:
            return state
                .set('users', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];
export const usersDictionarySelector = createSelector(stateSelector, state => state.users);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);

//actions

export const getUsers = () => {
    return {type: LOAD_USERS}
};



//sagas

export const saga = function* () {
    yield all([
        // takeEvery(START_REQUEST, toggleFetchingSaga),
        // takeEvery(SUCCESS_REQUEST, toggleFetchingSaga),
        // takeEvery(FAIL_REQUEST, toggleFetchingSaga),
        takeEvery(LOAD_USERS, getUsersSaga)
    ])
};

// DisplayName: "",
// Email: "test@test.ru"
// Id: 10169
// PData: {roles: {pmu: 1}, isAdmin: false}
// isAdmin: false
// roles: {pmu: 1}

function* getUsersSaga(){
    try {
        yield put({type: START_REQUEST});
        const users = yield call(_getUsers);

        //map userRoles

        users.map(user => {
            user.Role = user.PData.isAdmin ? 'a' : null;
            if(!user.Role){
                if(Object.entries(user.PData.roles).length > 0){
                    let roleList = [];
                    for(let role in user.PData.roles){
                        USER_ROLE_STRINGS[role] && roleList.push(role);
                    }
                    user.Role = roleList;
                }
            }
        });

        yield put({type: SET_USERS, payload: users});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message));
    }
}


const _getUsers = () => {
    return commonGetQuery("/api/users/list?role=a,pma,pms,pme,pmu")
};







