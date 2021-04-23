import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {checkStatus, commonGetQuery, update} from "common-tools/fetch-tools";
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage, showInfo} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {userWithSupervisorRightsSelectorFlatten} from "tt-ducks/dictionary";

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
const CHANGE_COMPONENT = `${prefix}/CHANGE_COMPONENT`; // runs before request
const UPDATE_COMPONENT = `${prefix}/UPDATE_COMPONENT`; // runs after request complete succesfully


//store

const ComponentsRecord = List([]);

export const ReducerRecord = Record({
    components: ComponentsRecord,
    fetching: false,
    selectedComponent: null,
    componentFormOpened: false
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_COMPONENTS:
            return state
                .set('components', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        case SET_SELECTED_COMPONENT:
            return state
                .set('selectedComponent', payload);
        case UPDATE_COMPONENT:
            return state.set('components', payload);
        case CLEAN_SELECTED_COMPONENT:
            return state.set('selectedComponent', null);
        case TOGGLE_COMPONENT_FORM_VISIBILITY:
            return state.set('componentFormOpened', payload);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];
export const componentsDictionarySelector = createSelector(stateSelector, state => state.components);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);
export const selectedComponentSelector = createSelector(stateSelector, state => state.selectedComponent);
export const componentFormOpenedSelector = createSelector(stateSelector, state => state.componentFormOpened);

//actions

export const getComponents = () => {
    return {type: LOAD_COMPONENTS}
};

export const selectComponent = (componentId) => {
    return {type: SELECT_COMPONENT_REQUEST, payload: componentId}
};

export const saveComponentChanges = (componentId, componentData) => {
    return {type: CHANGE_COMPONENT, payload: {componentId, componentData}}
};

export const updateComponent = (newComponentData) => {
    return {type: UPDATE_COMPONENT, payload: newComponentData};
};

export const toggleComponentForm = (isOn) => {
    return {type: TOGGLE_COMPONENT_FORM_VISIBILITY, payload: isOn}
};

export const setSelectedComponent = (component) => {
    return {type: SET_SELECTED_COMPONENT, payload: component}
};

export const cleanSelectedComponent = () => {
    return {type: CLEAN_SELECTED_COMPONENT}
};


//sagas

export const saga = function* () {
    yield all([
        takeEvery(LOAD_COMPONENTS, getComponentsSaga),
        takeEvery(SELECT_COMPONENT_REQUEST, selectComponentById),
        takeEvery(CHANGE_COMPONENT, changeComponent)
    ])
};

function* getComponentsSaga() {
    try {
        yield put({type: START_REQUEST});
        const params = yield select(paramsSelector);
        const components = yield call(_getComponents, params);

        //map components
        yield put({type: SUCCESS_REQUEST});
        const supervisors = yield select(userWithSupervisorRightsSelectorFlatten);

        components.forEach(component => {
            const supervisor = supervisors.find(sup => sup.Id === component.SupervisorId);
            component.SupervisorName = supervisor ? supervisor.DisplayName : '';
            component.StructName = component.Struct.Name;
        });
        yield put({type: SET_COMPONENTS, payload: components});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard())
        yield put(showErrorMessage(e.message));
    }
}

function* selectComponentById(data) {
    try {
        const components = yield select(componentsDictionarySelector);
        const findedComponent = components.find(component => component.Id === data.payload);
        yield put(setSelectedComponent(findedComponent));
    } catch (e) {
        yield put(showInfo({content: e}));
    }
}

function* changeComponent(data) {
    try {
        const components = yield select(componentsDictionarySelector);
        const componentIndex = components.findIndex(comp => comp.Id === data.payload.componentId);

        if (componentIndex >= 0) {
            components[componentIndex] = data.payload.componentData;
            yield put({type: START_REQUEST});

            const res = yield call(_updateComponent, data.payload.componentData);
            yield call(checkStatus, res);

            if (res.status === 403) {
                yield put({type: FAIL_REQUEST});
                yield put(showErrorMessage(res.message));
            }
            yield put({type: SUCCESS_REQUEST});
            yield put({type: UPDATE_COMPONENT, payload: components});
        }
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message));
    }
}

const _getComponents = (params) => {

    let _urlString = `/api/pm/process-struct/elements?${params}`;
    return commonGetQuery(_urlString)
};


const _updateComponent = (newComponentData) => {
    const {SupervisorId, Name, Struct} = newComponentData;
    const data = {
        "SupervisorId": SupervisorId,
        "Name": Name,
        "Struct": Struct
    };
    const jsoned = JSON.stringify(data);
    return update(`/api/pm/process-struct-elem/${newComponentData.Id}`, jsoned);
};






