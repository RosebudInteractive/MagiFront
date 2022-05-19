import { appName } from "../config";
import { List, Record } from "immutable";
import { createSelector } from 'reselect'
import { commonGetQuery, update } from "common-tools/fetch-tools";
import { all, call, put, select, takeEvery } from "@redux-saga/core/effects";
import { showErrorMessage, showInfo } from "tt-ducks/messages";
import {checkStatus, parseJSON} from "#common/tools/fetch-tools";
import { clearLocationGuard, paramsSelector } from "tt-ducks/route";
import { getRoleWithLowCaseKeys } from "../tools/permission-functions";

//constants

export const moduleName = 'access-rights-dictionary';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_RIGHTS = `${prefix}/SET_RIGHTS`;
const LOAD_RIGHTS = `${prefix}/LOAD_RIGHTS`;
const SET_PERMISSION_SCHEME = `${prefix}/SET_PERMISSION_SCHEME`;

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;

const SELECT_RIGHT_REQUEST = `${prefix}/SELECT_RIGHT_REQUEST`;
const SET_SELECTED_RIGHT = `${prefix}/SET_SELECTED_RIGHT`;
const SET_ROLES_WITH_PERMISSIONS = `${prefix}/SET_ROLES_WITH_PERMISSIONS`;
const LOAD_ROLES_WITH_PERMISSIONS = `${prefix}/LOAD_ROLES_WITH_PERMISSIONS`;

const CHANGE_RIGHT = `${prefix}/CHANGE_RIGHT`; // runs before request
const SAVE_NEW_RIGHT = `${prefix}/SAVE_NEW_RIGHT`; // runs before request
const DELETE_RIGHT = `${prefix}/DELETE_RIGHT`; 

//store

const RightsRecord = List([]);
const RolesPermissionsRecord = List([]);

export const ReducerRecord = Record({
    rights: RightsRecord,
    fetching: false,
    selectedRight: null,
    rightFormOpened: false,
    permissionScheme: null,
    rolesPermissions: RolesPermissionsRecord
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const { type, payload } = action;

    switch (type) {
        case SET_RIGHTS:
            return state.set('rights', payload);
        case SET_PERMISSION_SCHEME:
            return state.set('permissionScheme', payload);
        case START_REQUEST:
            return state.set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state.set('fetching', false);
        case SET_SELECTED_RIGHT:
            return state.set('selectedRight', payload);
        case SET_ROLES_WITH_PERMISSIONS:
            return state.set('rolesPermissions', payload);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];
export const rightsDictionarySelector = createSelector(stateSelector, state => state.rights);
export const rolesPermissionsSelector = createSelector(stateSelector, state => state.rolesPermissions);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);
export const currentRightsSelector = createSelector(stateSelector, state => state.selectedRight);
export const permissionSchemeSelector = createSelector(stateSelector, state => state.permissionScheme);

//actions

export const getRights = () => {
    return { type: LOAD_RIGHTS }
};

export const getRolesWithPermissions = () => {
    return { type: LOAD_ROLES_WITH_PERMISSIONS }
};

export const selectRight = (rightId) => {
    return { type: SELECT_RIGHT_REQUEST, payload: rightId }
};

export const saveRightChanges = (roleId, roleData) => {
    return { type: CHANGE_RIGHT, payload: { roleId, roleData } }
};

export const setSelectedRight = (right) => {
    return { type: SET_SELECTED_RIGHT, payload: right }
};

export const cleanSelectedRight = () => {
    return { type: SET_SELECTED_RIGHT, payload: null }
};

export const createNewRight = () => {
    return {
        type: SET_SELECTED_RIGHT, payload: {
            code: '',
            name: '',
            shortCode: '',
            description: '',
            isBuiltIn: true,
            permissions: {}
        }
    };
};

export const saveNewRight = (right)=>{
    return {
        type: SAVE_NEW_RIGHT, payload: right
    }
};

export const deleteRight = (id)=>{
    return {
        type: DELETE_RIGHT, payload: {id}
    }
};
//sagas

export const saga = function* () {
    yield all([
        takeEvery(LOAD_RIGHTS, getRightsSaga),
        takeEvery(SAVE_NEW_RIGHT, createRightSaga),
        takeEvery(SELECT_RIGHT_REQUEST, selectRightByIdSaga),
        takeEvery(CHANGE_RIGHT, changeRightSaga),
        takeEvery(DELETE_RIGHT, deleteRightSaga),
        takeEvery(LOAD_ROLES_WITH_PERMISSIONS, getRolesWithPermissionsSaga),
    ])
};

function* getRolesWithPermissionsSaga() {
    yield put({ type: START_REQUEST });
    try {
        const rights = yield call(_getRights);

        const roleIds = rights.map(x => x.Id);

        if (roleIds.length > 0) {

            const rolesFullInfo = yield all(roleIds.map(id => {
                return call(getRoleReq, id);
            }));

            yield put({ type: SET_ROLES_WITH_PERMISSIONS, payload: rolesFullInfo.map((role) => getRoleWithLowCaseKeys(role)) })
        }

        yield put({ type: SUCCESS_REQUEST });
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({ type: FAIL_REQUEST });
        yield put(showErrorMessage(e.message.toString()));
    }
}

function* getRightsSaga() {
    yield put({ type: START_REQUEST });
    try {
        const params = yield select(paramsSelector);
        const [rights, permissionScheme] = yield all([
            call(_getRights, params),
            call(getPermissionSchemeReq)
        ]);

        yield put({ type: SUCCESS_REQUEST });
        yield put({ type: SET_RIGHTS, payload: rights }); //.map((role) => getRoleWithLowCaseKeys(role))});

        yield put({ type: SET_PERMISSION_SCHEME, payload: permissionScheme });
        yield put({ type: SUCCESS_REQUEST });
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({ type: FAIL_REQUEST });
        yield put(showErrorMessage(e.message.toString()));
    }
}

function* selectRightByIdSaga({ payload }) {
    try {
        yield put({ type: START_REQUEST });
        const role = getRoleWithLowCaseKeys(yield call(getRoleReq, payload));
        yield put(setSelectedRight(role));

        yield put({ type: SUCCESS_REQUEST });
    } catch (e) {
        yield put({ type: FAIL_REQUEST });
        yield put(showInfo({ content: e }));
    }
}

function* createRightSaga({ payload }) {
    const newRight = { ...payload };
    yield put({ type: START_REQUEST })
    try {
        const right = yield call(_createRightReq, newRight);
        console.log(right);
        yield put({type: SUCCESS_REQUEST});
//        const rights = yield select(rightsDictionarySelector);
        newRight.Id = right.id || right.Id;
        rights.push(newRight);

        yield put(setSelectedRight(newRight));
    } catch (e) {
        yield put({ type: FAIL_REQUEST })
        yield put(showErrorMessage(e.message))
    }
}

function* deleteRightSaga({ payload }) {
    yield put({ type: START_REQUEST })
    try {
        yield call(_deleteRight, payload.id);
        yield put({type: SUCCESS_REQUEST});
        const rights = yield select(rightsDictionarySelector);
        yield put(getRights());
    } catch (e) {
        yield put({ type: FAIL_REQUEST })
        yield put(showErrorMessage(e.message))
    }
}

function* changeRightSaga(data) {
    yield put({ type: START_REQUEST })
    try {
        const res = yield call(_updateRight, data.payload.roleId, data.payload.roleData);

        if (res.status === 403) {
            yield put({ type: FAIL_REQUEST });
            yield put(showErrorMessage(res.message));
        }
        yield put({ type: SUCCESS_REQUEST });
        yield put(getRights());
    } catch (e) {
        yield put({ type: FAIL_REQUEST });
        yield put(showErrorMessage(e.message.toString()));
    }
}

const _getRights = (params) => {
    let _urlString = `/api/pm/role-list${params ? `?${params}` : ''}`;
    return commonGetQuery(_urlString)
};


const _updateRight = (roleId, roleData) => {
    return update(`/api/pm/role/${roleId}`, JSON.stringify(roleData));
};

const _deleteRight = (roleId) => {
    return fetch(`/api/pm/role/${roleId}`, {
        method: 'DELETE',
        headers: { "Content-type": "application/json" },
        credentials: 'include'
    })
    .then(checkStatus)
    .then(parseJSON)
};

const _createRightReq = (body) => {
    return fetch("/api/pm/role", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(body),
    })
    .then(checkStatus)
    .then(parseJSON)
};

const getRoleReq = (roleId) => commonGetQuery(`/api/pm/role/${roleId}`);

const getPermissionSchemeReq = () => commonGetQuery('/api/permission-scheme');





