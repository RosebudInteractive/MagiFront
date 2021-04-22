import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {commonGetQuery, update} from "common-tools/fetch-tools";
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage, showInfo} from "tt-ducks/messages";
import {USER_ROLE_STRINGS} from '../constants/dictionary-users'
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";


//constants

export const moduleName = 'users-dictionary';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_USERS = `${prefix}/SET_USERS`;
const LOAD_USERS = `${prefix}/LOAD_USERS`;

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;
const TOGGLE_USER_FORM_VISIBILITY = `${prefix}/TOGGLE_USER_FORM_VISIBILITY`;

const SELECT_USER_REQUEST = `${prefix}/SELECT_USER_REQUEST`;
const SET_SELECTED_USER = `${prefix}/SET_SELECTED_USER`;
const CLEAN_SELECTED_USER = `${prefix}/CLEAN_SELECTED_USER`;
const FIND_USER_BY_EMAIL = `${prefix}/FIND_USER_BY_EMAIL`;
const FIND_USER_BY_ID = `${prefix}/FIND_USER_BY_ID`;
const CHANGE_USER = `${prefix}/CHANGE_USER`; // runs before request
const UPDATE_USER = `${prefix}/UPDATE_USER`; // runs after request complete succesfully

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

//store

// const UsersRecord = List([]);

export const ReducerRecord = Record({
    users: [],
    fetching: false,
    selectedUser: null,
    userFormOpened: false
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
        case SET_SELECTED_USER: {
            return state
                .set('selectedUser', payload);
        }
        case UPDATE_USER: {
            return state.set('users', payload);
        }
        case CLEAN_SELECTED_USER:
            return state.set('selectedUser', null);
        case TOGGLE_USER_FORM_VISIBILITY:
            return state.set('userFormOpened', payload);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];
export const usersDictionarySelector = createSelector(stateSelector, state => state.users);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);
export const selectedUserSelector = createSelector(stateSelector, state => state.selectedUser);
export const userFormOpenedSelector = createSelector(stateSelector, state => state.userFormOpened);

//actions

export const getUsers = () => {
    return {type: LOAD_USERS}
};

export const selectUser = (userId) => {
    return {type: SELECT_USER_REQUEST, payload: userId}
};

export const saveUserChanges = (userData) => {
    return {type: CHANGE_USER, payload: {userData}}
};


export const toggleUserForm = (isOn) => {
    return {type: TOGGLE_USER_FORM_VISIBILITY, payload: isOn}
};

export const findUserByEmail = (email) => {
    return {type: FIND_USER_BY_EMAIL, payload: email}
};

export const setSelectedUser = (user) => {
    return {type: SET_SELECTED_USER, payload: user}
};

export const cleanSelectedUser = () => {
  return {type: CLEAN_SELECTED_USER}
};



//sagas

export const saga = function* () {
    yield all([
        takeEvery(LOAD_USERS, getUsersSaga),
        takeEvery(SELECT_USER_REQUEST, selectUserById),
        takeEvery(FIND_USER_BY_EMAIL, selectUserEmail),
        takeEvery(CHANGE_USER, changeUser)
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
        const params = yield select(paramsSelector);
        const users = yield call(_getUsers, params);

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
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard())
        yield put(showErrorMessage(e.message));
    }
}

function* selectUserById(data){
    try {
        const users = yield select(usersDictionarySelector);
        const findedUser = users.find(user => user.Id === data.payload);
        yield put(setSelectedUser(findedUser));
    } catch (e) {
        yield put(showInfo({content: e}));
    }
}

function* selectUserEmail(data){
    try {
        const users = yield select(usersDictionarySelector);
        const findedUser = users.find(user => user.Email === data.payload);
        if(findedUser){
            yield put(showInfo({content: 'Пользователь есть в системе', title: 'Пользователь есть'}))
            yield put(setSelectedUser(findedUser));
        }
    } catch (e) {
        yield put(showInfo({content: 'Ошибка при выборе пользователя', title: 'Ошибка при выборе пользователя'}));
    }
}

function* changeUser(data){
    try {
        const users = yield select(usersDictionarySelector);
        const userIndex = users.findIndex(user => user.Id === data.payload.userData.Id);
        if ((userIndex) && userIndex >= 0) {
            users[userIndex] = data.payload.userData;
            yield put({type: UPDATE_USER, payload: users});
            yield put({type:START_REQUEST});
            yield call(_updateUser, data.payload.userData);
            yield put({type:SUCCESS_REQUEST});
        }
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showInfo({content: 'Ошибка при обновлении пользователя', title: 'Ошибка при обновлении пользователя'}));
    }
}

const _getUsers = (params) => {


    let _urlString = '';
    if(params.includes('role=')){
        _urlString = `/api/users/list?${params}`;
    } else {
        _urlString = `/api/users/list?role=a,pma,pms,pme,pmu&${params}`;
    }

    return commonGetQuery(_urlString)
};

const _updateUser = (newUserData) => {
    const userDataRoles = newUserData.PData.roles;
    const data = {
        "alter":  {
            "PData": {
                "roles": {
                    ...userDataRoles
                }
            }
        }
    };
    const jsoned = JSON.stringify(data);
    return update(`/api/users/${newUserData.Id}`, jsoned);
}







