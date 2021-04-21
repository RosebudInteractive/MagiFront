import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {commonGetQuery} from "common-tools/fetch-tools";
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage, showInfo} from "tt-ducks/messages";
import {USER_ROLE_STRINGS} from '../constants/dictionary-users'
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";

//TODO rename all для Components вместо users

//constants

export const moduleName = 'components-dictionary';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_COMPONENTS = `${prefix}/SET_COMPONENTS`;
const LOAD_COMPONENTS = `${prefix}/LOAD_COMPONENTS`;

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;
const TOGGLE_COMPONENT_FORM_VISIBILITY = `${prefix}/TOGGLE_COMPONENT_FORM_VISIBILITY`;

const SELECT_COMPONENT_REQUEST = `${prefix}/SELECT_COMPONENT_REQUEST`;
const SET_SELECTED_COMPONENT = `${prefix}/SET_SELECTED_COMPONENT`;
const CLEAN_SELECTED_COMPONENT = `${prefix}/CLEAN_SELECTED_COMPONENT`;
const FIND_COMPONENT_BY_EMAIL = `${prefix}/FIND_COMPONENT_BY_EMAIL`;
const FIND_COMPONENT_BY_ID = `${prefix}/FIND_COMPONENT_BY_ID`;
const CHANGE_COMPONENT = `${prefix}/CHANGE_COMPONENT`; // runs before request
const UPDATE_COMPONENT = `${prefix}/CHANGE_COMPONENT`; // runs after request complete succesfully

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

const ComponentsRecord = List([]);

export const ReducerRecord = Record({
    components: []
    // name: '',
    // responsible: '',
    // projectStructure: ''
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_COMPONENTS:
            return state
                .set('users', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        case SET_SELECTED_COMPONENT: {
            return state
                .set('selectedUser', payload);
        }
        case UPDATE_COMPONENT: {
            // const userIndex = state.users.findIndex(user => user.Id === payload.Id); //todo move to sagas
            // const updatedUser = payload;
            // if(userIndex > 0) {
            //     return state.users.set(userIndex, updatedUser);
            // } else {
            //     return state;
            // }

            return state.users.set(payload.index, payload.updatedUser);


        }
        case CLEAN_SELECTED_COMPONENT:
            return state.set('selectedUser', null);
        case TOGGLE_COMPONENT_FORM_VISIBILITY:
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
    return {type: LOAD_COMPONENTS}
};

export const selectUser = (userId) => {
    return {type: SELECT_COMPONENT_REQUEST, payload: userId}
};

export const saveUserChanges = (userId, userData) => {
    return {type: CHANGE_COMPONENT, payload: {userId, userData}}
};

export const updateUser = (newUserData) => {
    return {type: UPDATE_COMPONENT, payload: newUserData};
};

export const toggleUserForm = (isOn) => {
    return {type: TOGGLE_COMPONENT_FORM_VISIBILITY, payload: isOn}
};

export const findUserByEmail = (email) => {
    return {type: FIND_COMPONENT_BY_EMAIL, payload: email}
};

export const setSelectedUser = (user) => {
    return {type: SET_SELECTED_COMPONENT, payload: user}
};

export const cleanSelectedUser = () => {
    return {type: CLEAN_SELECTED_COMPONENT}
};


//sagas

export const saga = function* () {
    yield all([
        takeEvery(LOAD_COMPONENTS, getUsersSaga),
        takeEvery(SELECT_COMPONENT_REQUEST, selectUserById),
        takeEvery(FIND_COMPONENT_BY_EMAIL, selectUserEmail)
    ])
};

// DisplayName: "",
// Email: "test@test.ru"
// Id: 10169
// PData: {roles: {pmu: 1}, isAdmin: false}
// isAdmin: false
// roles: {pmu: 1}

function* getUsersSaga() {
    try {
        yield put({type: START_REQUEST});
        const params = yield select(paramsSelector);
        const users = yield call(_getUsers, params);

        //map userRoles

        users.map(user => {
            user.Role = user.PData.isAdmin ? 'a' : null;
            if (!user.Role) {
                if (Object.entries(user.PData.roles).length > 0) {
                    let roleList = [];
                    for (let role in user.PData.roles) {
                        USER_ROLE_STRINGS[role] && roleList.push(role);
                    }
                    user.Role = roleList;
                }
            }
        });

        yield put({type: SET_COMPONENTS, payload: users});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard())
        yield put(showErrorMessage(e.message));
    }
}

function* selectUserById(data) {
    try {
        const users = yield select(usersDictionarySelector);
        const findedUser = users.find(user => user.Id === data.payload);
        yield put(setSelectedUser(findedUser));
    } catch (e) {
        yield put(showInfo({content: e}));
    }
}

function* selectUserEmail(data) {
    try {
        const users = yield select(usersDictionarySelector);
        const findedUser = users.find(user => user.Email === data.payload);
        if (findedUser) {
            yield put(showInfo({content: 'Пользователь есть в системе', title: 'Пользователь есть'}))
            yield put(setSelectedUser(findedUser));
        }
    } catch (e) {
        yield put(showInfo({content: 'Ошибка при выборе пользователя', title: 'Ошибка при выборе пользователя'}));
    }
}

const _getUsers = (params) => {
    let _urlString = '';
    if (params.includes('role=')) {
        _urlString = `/api/users/list?${params}`;
    } else {
        _urlString = `/api/users/list?role=a,pma,pms,pme,pmu&${params}`;
    }

    return commonGetQuery(_urlString)
};







