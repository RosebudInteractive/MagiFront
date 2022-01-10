import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {commonGetQuery, update} from "common-tools/fetch-tools";
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage, showInfo} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";

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
const TOGGLE_RIGHT_FORM_VISIBILITY = `${prefix}/TOGGLE_RIGHT_FORM_VISIBILITY`;

const SELECT_RIGHT_REQUEST = `${prefix}/SELECT_RIGHT_REQUEST`;
const SET_SELECTED_RIGHT = `${prefix}/SET_SELECTED_RIGHT`;
const SET_ROLES_WITH_PERMISSIONS = `${prefix}/SET_ROLES_WITH_PERMISSIONS`;
const LOAD_ROLES_WITH_PERMISSIONS = `${prefix}/LOAD_ROLES_WITH_PERMISSIONS`;
const CLEAN_SELECTED_RIGHT = `${prefix}/CLEAN_SELECTED_RIGHT`;
const CHANGE_RIGHT = `${prefix}/CHANGE_RIGHT`; // runs before request
const UPDATE_RIGHT = `${prefix}/UPDATE_RIGHT`; // runs after request complete succesfully


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
    const {type, payload} = action;

    switch (type) {
        case SET_RIGHTS:
            return state
                .set('rights', payload);
        case SET_PERMISSION_SCHEME:
            return state
                .set('permissionScheme', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        case SET_SELECTED_RIGHT:
            return state
                .set('selectedRight', payload);
        case UPDATE_RIGHT:
            return state.set('rights', payload);
        case CLEAN_SELECTED_RIGHT:
            return state.set('selectedRight', null);
        case TOGGLE_RIGHT_FORM_VISIBILITY:
            return state.set('rightFormOpened', payload);
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
export const selectedRightSelector = createSelector(stateSelector, state => state.selectedRight);
export const rightFormOpenedSelector = createSelector(stateSelector, state => state.rightFormOpened);
export const permissionSchemeSelector = createSelector(stateSelector, state => state.permissionScheme);

//actions

export const getRights = () => {
    return {type: LOAD_RIGHTS}
};

export const getRolesWithPermissions = () => {
    return {type: LOAD_ROLES_WITH_PERMISSIONS}
};

export const selectRight = (rightId) => {
    return {type: SELECT_RIGHT_REQUEST, payload: rightId}
};

export const saveRightChanges = (roleId, roleData) => {
    return {type: CHANGE_RIGHT, payload: {roleId, roleData}}
};

export const toggleRightForm = (isOn) => {
    return {type: TOGGLE_RIGHT_FORM_VISIBILITY, payload: isOn}
};

export const setSelectedRight = (right) => {
    return {type: SET_SELECTED_RIGHT, payload: right}
};

export const cleanSelectedRight = () => {
    return {type: CLEAN_SELECTED_RIGHT}
};


//sagas

export const saga = function* () {
    yield all([
        takeEvery(LOAD_RIGHTS, getRightsSaga),
        takeEvery(SELECT_RIGHT_REQUEST, selectRightByIdSaga),
        takeEvery(CHANGE_RIGHT, changeRightSaga),
        takeEvery(LOAD_ROLES_WITH_PERMISSIONS, getRolesWithPermissionsSaga)
    ])
};

function* getRolesWithPermissionsSaga() {
    yield put({type: START_REQUEST});
    try {
        const rights = yield call(_getRights);



        const roleIds = rights.map(x => x.Id);

        if(roleIds.length > 0){

            const rolesFullInfo = yield all(roleIds.map(id => {
                return call(getRoleReq, id);
            }));


            yield put({type: SET_ROLES_WITH_PERMISSIONS, payload: rolesFullInfo})
        }

        yield put({type: SUCCESS_REQUEST});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message.toString()));
    }
}

function* getRightsSaga() {
    yield put({type: START_REQUEST});
    try {
        const params = yield select(paramsSelector);
        const [ rights, permissionScheme]  = yield all([
            call(_getRights, params),
            call(getPermissionSchemeReq)
        ]);

        yield put({type: SUCCESS_REQUEST});
        yield put({type: SET_RIGHTS, payload: rights});

        yield put({type: SET_PERMISSION_SCHEME, payload: permissionScheme});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message.toString()));
    }
}

function* selectRightByIdSaga({payload}) {
    try {
        yield put({type: START_REQUEST});

        const role = yield call(getRoleReq, payload);

        yield put(setSelectedRight(role));

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showInfo({content: e}));
    }
}

function* changeRightSaga(data) {
    try {

         const res = yield call(_updateRight, data.payload.roleId, data.payload.roleData);

         if (res.status === 403) {
             yield put({type: FAIL_REQUEST});
             yield put(showErrorMessage(res.message));
         }
         yield put({type: SUCCESS_REQUEST});
         yield put(getRights());
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message.toString()));
    }
}

const _getRights = (params) => {
    let _urlString = `/api/pm/role-list${params ? `?${params}`: ''}`;
    return commonGetQuery(_urlString)
};


const _updateRight = (roleId, roleData) => {
    return update(`/api/pm/role/${roleId}`, JSON.stringify(roleData));
};

const getRoleReq = (roleId) => commonGetQuery(`/api/pm/role/${roleId}`);

const getPermissionSchemeReq = () => commonGetQuery('/api/permission-scheme');





