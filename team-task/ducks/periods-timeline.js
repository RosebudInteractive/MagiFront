import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {push} from "react-router-redux/src";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import {commonGetQuery} from "tools/fetch-tools";
import {Period} from "../types/periods";
import moment from "moment";


const fakeTimelines = [
    {
        Id: 1,
        Name: 'Таймлайн 1',
        ShortName: 'Тм1',
        Code: 1,
        TypeOfUse: 2,
        NameOfLectionOrCourse: 'Курс для Таймлайна',
        State: 2,
        OrderNumber: 1,
        Course: null,
        Lesson: null,
        HasScript: true,
        TimeCr: new Date()
    },
    {
        Id: 2,
        Name: 'Таймлайн 2',
        ShortName: 'Тм2',
        TypeOfUse: 2,
        Code: 2,
        NameOfLectionOrCourse: 'Курс для Таймлайна',
        State: 1,
        OrderNumber: 2,
        Course: null,
        Lesson: null,
        HasScript: false,
        TimeCr: new Date()
    },
    {
        Id: 3,
        Name: 'Таймлайн 3',
        ShortName: 'Тм3',
        TypeOfUse: 2,
        Code: 3,
        NameOfLectionOrCourse: 'Курс для Таймлайна',
        State: 2,
        OrderNumber: 3,
        Course: null,
        Lesson: null,
        HasScript: true,
        TimeCr: new Date()
    },
    {
        Id: 4,
        Name: 'Таймлайн 4',
        ShortName: 'Тм4',
        TypeOfUse: 2,
        Code: 4,
        NameOfLectionOrCourse: 'Курс для Таймлайна',
        State: 1,
        OrderNumber: 4,
        Course: null,
        Lesson: null,
        HasScript: false,
        TimeCr: new Date()
    },
    {
        Id: 5,
        Name: 'Таймлайн 5',
        ShortName: 'Тм5',
        TypeOfUse: 2,
        Code: 5,
        Course: null,
        Lesson: null,
        NameOfLectionOrCourse: 'Курс для Таймлайна',
        State: 2,
        OrderNumber: 5,
        HasScript: true,
        TimeCr: new Date()
    }
];

//constants

export const moduleName = 'periods-timeline';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_PERIODS = `${prefix}/SET_PERIODS`;
const LOAD_PERIODS = `${prefix}/LOAD_PERIODS`;

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;

const TOGGLE_EDITOR = `${prefix}/TOGGLE_EDITOR`;

const SELECT_PERIOD = `${prefix}/SELECT_PERIOD`;
const UNSELECT_PERIOD = `${prefix}/UNSELECT_PERIOD`;
const OPEN_EDITOR = `${prefix}/OPEN_EDITOR`;
const GO_BACK = `${prefix}/GO_BACK`;

const CREATE_NEW_PERIOD = `${prefix}/CREATE_NEW_PERIOD`;
const UPDATE_PERIOD = `${prefix}/UPDATE_PERIOD`;
const REMOVE_PERIOD = `${prefix}/REMOVE_PERIOD`;
const GET_PERIOD = `${prefix}/GET_PERIOD`;
const FIND_PERIOD = `${prefix}/FIND_PERIOD`;
const SET_FINDED = `${prefix}/SET_FINDED`;
const SET_TEMPORARY_PERIODS = `${prefix}/SET_TEMPORARY_PERIODS`;

// const SELECT_COMPONENT_REQUEST = `${prefix}/SELECT_COMPONENT_REQUEST`;
// const SET_SELECTED_COMPONENT = `${prefix}/SET_SELECTED_COMPONENT`;
// const CLEAN_SELECTED_COMPONENT = `${prefix}/CLEAN_SELECTED_COMPONENT`;
// const CHANGE_COMPONENT = `${prefix}/CHANGE_COMPONENT`; // runs before request
// const UPDATE_COMPONENT = `${prefix}/UPDATE_COMPONENT`; // runs after request complete succesfully


//store


const PeriodsRecord = List<Period>([]);
const PeriodRecord: Period = {};

export const ReducerRecord = Record({
    periods: PeriodsRecord,
    fetching: false,
    selectedPeriod: PeriodRecord,
    editorOpened: false,
    finded: null,
    temporary: null,
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_PERIODS:
            return state
                .set('periods', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        case SELECT_PERIOD:
            console.log('selected event:', payload);
            return state
                .set('selectedPeriod', payload);
        case UNSELECT_PERIOD:
            return state.set('selectedPeriod', payload);
        case TOGGLE_EDITOR:
            console.log('TOGGLE_EDITOR', payload);
            return state.set('editorOpened', payload);
        case SET_FINDED:
            console.log('SET_FINDED,', payload);
            return state.set('finded', payload);
        case SET_TEMPORARY_PERIODS:
            return state.set('temporary', payload);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];

export const currentPeriodSelector = createSelector(stateSelector, state => state.selectedPeriod);
export const periodsFetchingSelector = createSelector(stateSelector, state => state.fetching);
export const periodsSelector = createSelector(stateSelector, state => state.periods);
export const periodEditorOpenedSelector = createSelector(stateSelector, state => state.editorOpened);

export const findedPeriodsSelector = createSelector(stateSelector, state => state.finded);
export const temporaryPeriodsSelector = createSelector(stateSelector, state => state.temporary);

//actions

export const requestPeriods = () => {
    return {type: LOAD_PERIODS}
};

export const createNewPeriod = (period) => {
    return {type: CREATE_NEW_PERIOD, payload: period};
};

// export const selectPeriod = (timelineId) => {
//     return {type: SELECT_PERIOD, payload: timelineId}
// };

export const findPeriod = (data) => {
    return {type: FIND_PERIOD, payload: data}
};

export const setTemporaryPeriods = (data) => {
    return {type: SET_TEMPORARY_PERIODS, payload: data}
};

export const openPeriodEditor = ({periodId = null, timelineId = null}) => {
    console.log('openEventEditor, {eventId, timelineId}', {periodId, timelineId});
    return {type: OPEN_EDITOR, payload: {periodId, timelineId}}
};

export const toggleEditorTo = (isOn) => {
    return {type: TOGGLE_EDITOR, payload: isOn}
};

export const goBack = () => {
    return {type: GO_BACK}
};

export const updatePeriodData = ({periodId, periodData}) => {
    return {type: UPDATE_PERIOD, payload: {...periodData, Id: periodId}}
}

export const removePeriod = (periodId) => {
    return {type: REMOVE_PERIOD, payload: periodId}
};

//sagas

export const saga = function* () {
    yield all([
        takeEvery(OPEN_EDITOR, openEditorSaga),
        takeEvery(SELECT_PERIOD, selectPeriodSaga),
        takeEvery(GO_BACK, goBackSaga),
        takeEvery(LOAD_PERIODS, getPeriodsSaga),
        takeEvery(CREATE_NEW_PERIOD, createPeriodSaga),
        takeEvery(UPDATE_PERIOD, updatePeriodSaga),
        takeEvery(REMOVE_PERIOD, removePeriodSaga),
        takeEvery(GET_PERIOD, getPeriodSaga),
        takeEvery(FIND_PERIOD, findPeriodSaga)
    ])
};

function* findPeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});
        //todo pase data here
        // const dat

        const date = parseInt(data.payload),
            year = parseInt(data.payload),
            name = data.payload;

        const response = yield call(findPeriodBy, {name, year, date});
        console.log('findPeriodSaga response: ', response)
        yield put({type: SET_FINDED, payload: response});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.log(e);
        showErrorMessage(e);
    }
}

function* getPeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const period = yield call(getPeriod, data.payload);

        yield put({type: SELECT_PERIOD, payload: period});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* removePeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const res = yield call(deletePeriod, data.payload);

        console.log('RES', res.Error);

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.log('EEEEE:,', e);
        console.dir(e);
        yield put(showErrorMessage(e.toString()));
    }
}

function* updatePeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(updatePeriod, data.payload);

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* createPeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(createPeriod, data.payload);

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* selectPeriodSaga(data) {
    try {
        const periods = yield select(periodsSelector);
        const periodToSetInEditor = periods.find(ev => ev.Id === data.payload);

        if (periodToSetInEditor) {
            yield put({type: SELECT_PERIOD, payload: periodToSetInEditor});
        }
    } catch (e) {
        console.log(e);
    }
}

function* openEditorSaga(data) {
    try {
        console.log('openEditorSaga: ', data);
        if (data.payload.periodId || data.payload.timelineId) {
            let period = null;
            if (data.payload.periodId) {
                const periods = yield select(periodsSelector);
                period = periods.find(ev => ev.Id === data.payload.periodId);
                console.log('period openEditorSaga:, ', period)
                yield put({type: SELECT_PERIOD, payload: period});
            } else {
                const date = new Date();
                console.log('data.payload:, ', data.payload)
                if (data.payload.timelineId) {
                    console.log("data.payload.timelineId", data.payload.timelineId);
                    yield put({
                        type: SELECT_PERIOD, payload: {
                            Name: '',
                            ShortName: '',
                            Description: '',
                            TlCreationId: data.payload.timelineId,
                            TlPublicId: null,
                            EffDate: date.toLocaleDateString(),
                            Date: date.getDate(),
                            Month: date.getMonth(),
                            Year: date.getFullYear()
                        }
                    });
                } else {
                    console.log("nothing");
                    yield put({
                        type: SELECT_PERIOD, payload: {
                            Name: '',
                            ShortName: '',
                            Description: '',
                            TlCreationId: null,
                            TlPublicId: null,
                            EffDate: date.toLocaleDateString(),
                            Date: date.getDate(),
                            Month: date.getMonth(),
                            Year: date.getFullYear()
                        }
                    });
                }
            }

            yield put({type: TOGGLE_EDITOR, payload: true});
        } else {
            const date = new Date();
            yield put({
                type: SELECT_PERIOD, payload: {
                    Name: '',
                    ShortName: '',
                    Description: '',
                    TlCreationId: null,
                    TlPublicId: null,
                    EffDate: date.toLocaleDateString(),
                    Date: date.getDay(),
                    Month: date.getMonth(),
                    Year: date.getFullYear()
                }
            });
            yield put({type: TOGGLE_EDITOR, payload: true});
        }
    } catch (e) {
        console.log(e)
    }
}

function* goBackSaga() {
    yield put(push(`/periods`))
}

function* getPeriodsSaga() {
    yield put({type: START_REQUEST});
    try {
        const params = yield select(paramsSelector);
        const periods = yield call(getPeriods, params);

        //todo map periods if it need

        yield put({type: SET_PERIODS, payload: periods});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

const findPeriodBy = ({name, year, date}) => {
    let _urlString = `/api/pm/period-list?Name=${name}&Year=${year}&date=${date}`;
    return commonGetQuery(_urlString);
};

const createPeriod = (period) => {
    const dateObject = (period.date && period.month && period.year) ? moment(`${period.year}-${period.month}-${period.date}`) : null;
    const periodData = {
        Name: period.name,
        TlCreationId: period.tlCreationId,
        Date: dateObject,
        Month: period.month,
        Year: period.year,
        ShortName: period.shortName,
        Description: period.description
    };
    console.log('create period');
    console.log(period)
    return fetch("/api/pm/period", {
        method: 'POST',
        headers: {"Content-type": "application/json"},
        credentials: 'include',
        body: JSON.stringify(periodData),
    })
        .then(checkStatus)
        .then(parseJSON)
};

const updatePeriod = (period) => {
    const dateObject = (period.date && period.month && period.year) ? moment(`${period.year}-${period.month}-${period.date}`) : null;
    const periodData = {
        Id: period.Id,
        Name: period.name,
        TlCreationId: period.tlCreationId,
        Date: dateObject,
        Month: parseInt(period.month),
        Year: parseInt(period.year),
        ShortName: period.shortName,
        Description: period.description
    };

    return fetch(`/api/pm/period/${period.Id}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(periodData),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const deletePeriod = (periodId) => {
    return fetch(`/api/pm/period/${periodId}`, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json"
        },
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const getPeriods = (params) => {
    let _urlString = `/api/pm/period-list${params ? `?${params}` : ''}`;
    return commonGetQuery(_urlString);
};

const getPeriod = (id) => {
    return commonGetQuery(`/api/pm/event/${id}`);
};







