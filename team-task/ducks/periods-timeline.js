import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, race, select, take, takeEvery} from "@redux-saga/core/effects";
import {MODAL_MESSAGE_ACCEPT, MODAL_MESSAGE_DECLINE, showErrorMessage, showUserConfirmation} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {push} from "react-router-redux/src";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import {commonGetQuery} from "tools/fetch-tools";
import {Period} from "../types/periods";
import moment from "moment";
import {getOneTimeline} from "tt-ducks/timelines";
import type {Message} from "../types/messages";
import $ from "jquery";
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
const CREATE_PERIODS = `${prefix}/CREATE_PERIODS`;
const SET_SELECTED_PERIOD = `${prefix}/SET_SELECTED_PERIOD`;

//store

const PeriodsRecord = List<Period>([]);
const PeriodRecord: Period = {};

export const ReducerRecord = Record({
    periods: PeriodsRecord,
    fetching: false,
    selectedPeriod: PeriodRecord,
    editorOpened: false,
    finded: null,
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
        case SET_SELECTED_PERIOD:
            return state
                .set('selectedPeriod', payload);
        case UNSELECT_PERIOD:
            return state.set('selectedPeriod', payload);
        case TOGGLE_EDITOR:
            return state.set('editorOpened', payload);
        case SET_FINDED:
            return state.set('finded', payload);
        case SET_TEMPORARY_PERIODS:
            console.log('SET_TEMPORARY_PERIODS, payload', payload);
            const mapped = payload.map(pr => ({
                ...pr,
                Name: pr.name,
                ShortName: pr.shortName,
                Description: pr.description,
                StartDate: pr.startDate,
                StartMonth: pr.startMonth,
                StartYear: pr.startYear,
                EndDate: pr.endDate,
                EndMonth: pr.endMonth,
                EndYear: pr.endYear
            }));
            return state.set('periods', mapped);
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
export const temporaryPeriodsSelector = createSelector(stateSelector, state => state.periods);

//actions

export const createPeriods = ({periods, timelineId}) => {
    return {type: CREATE_PERIODS, payload: {periods, timelineId}};
};

export const requestPeriods = () => {
    return {type: LOAD_PERIODS}
};

export const createNewPeriod = (period) => {
    return {type: CREATE_NEW_PERIOD, payload: period};
};

export const findPeriod = (data) => {
    return {type: FIND_PERIOD, payload: data}
};

export const setTemporaryPeriods = (data) => {
    return {type: SET_TEMPORARY_PERIODS, payload: data}
};

export const openPeriodEditor = ({periodId = null, timelineId = null, period = null}) => {
    return {type: OPEN_EDITOR, payload: {periodId, timelineId, period}}
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
        takeEvery(FIND_PERIOD, findPeriodSaga),
        takeEvery(CREATE_PERIODS, createPeriodsSaga),
    ])
};

function* createPeriodsSaga(data) {
    try {
        let periodsToCreate = [];
        if (data.payload.periods && data.payload.periods.length > 0) {
            periodsToCreate = data.payload.periods;
        } else {
            periodsToCreate = yield select(temporaryPeriodsSelector);
        }

        yield put({type: START_REQUEST});

        if (data.payload.timelineId) {

            const finalPeriods = [...periodsToCreate.map(ev => ({...ev, TlCreationId: data.payload.timelineId}))];


            yield all(
                finalPeriods.map((ev) => {
                    console.log(ev);
                    return call(createPeriod, ev)
                })
            );
        }


        yield put({type: SUCCESS_REQUEST});

    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.toString()))
    }
}

function* findPeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const paramsObject = {};

        const numberDate = parseInt(data.payload);

        if (!isNaN(numberDate)) {
            paramsObject.Date = numberDate;
            paramsObject.Year = numberDate;
        } else {
            paramsObject.Name = data.payload;
        }

        const response = yield call(findPeriodBy, $.param(paramsObject));

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

        yield put({type: SET_SELECTED_PERIOD, payload: period});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* removePeriodSaga(data) {
    const message: Message = {
        content: `Удалить период #${data.payload}?`,
        title: "Подтверждение удаления"
    };

    yield put(showUserConfirmation(message))

    const {accept} = yield race({
        accept: take(MODAL_MESSAGE_ACCEPT),
        decline: take(MODAL_MESSAGE_DECLINE)
    });

    if (!accept) return;


    try {
        yield put({type: START_REQUEST});

        const res = yield call(deletePeriod, data.payload);

        yield put({type: SUCCESS_REQUEST});
        yield put(getOneTimeline({id: data.payload.tlCreationId, setToEditor: true}))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.dir(e);
        yield put(showErrorMessage(e.toString()));
    }
}

function* updatePeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(updatePeriod, data.payload);

        yield put({type: SUCCESS_REQUEST});
        yield put(getOneTimeline({id: data.payload.tlCreationId, setToEditor: true}))
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
        yield put(getOneTimeline({id: data.payload.tlCreationId, setToEditor: true}))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* selectPeriodSaga(data) {
    try {

        if (data.payload && data.payload.Id) {
            yield put({
                type: SET_SELECTED_PERIOD, payload: {
                    ...data.payload,
                    startDate: data.payload.LbDate,
                    endDate: data.payload.RbDate
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
}

function* openEditorSaga(data) {
    try {
        if (data.payload.periodId || data.payload.timelineId) {
            let period = null;
            if (data.payload.periodId) {
                const periods = yield select(periodsSelector);
                period = periods && periods.length > 0 && periods.find(pr => pr.Id === data.payload.periodId);


                if (period) {
                    yield put({type: SET_SELECTED_PERIOD, payload: period});
                } else {
                    if (data.payload.period) {
                        yield put({type: SET_SELECTED_PERIOD, payload: data.payload.period});
                    }
                }

            } else {
                const date = new Date();

                if (data.payload.timelineId) {

                    yield put({
                        type: SET_SELECTED_PERIOD, payload: {
                            Name: '',
                            ShortName: '',
                            Description: '',
                            TlCreationId: data.payload.timelineId,
                            TlPublicId: null,
                            LbEffDate: date.toLocaleDateString(),
                            LbDate: date.getDate(),
                            LbMonth: date.getMonth(),
                            LbYear: date.getFullYear(),
                            RbEffDate: date.toLocaleDateString(),
                            RbDate: date.getDate(),
                            RbMonth: date.getMonth(),
                            RbYear: date.getFullYear()
                        }
                    });
                } else {
                    yield put({
                        type: SET_SELECTED_PERIOD, payload: {
                            Name: '',
                            ShortName: '',
                            Description: '',
                            TlCreationId: null,
                            TlPublicId: null,
                            LbEffDate: date.toLocaleDateString(),
                            LbDate: date.getDate(),
                            LbMonth: date.getMonth(),
                            LbYear: date.getFullYear(),
                            RbEffDate: date.toLocaleDateString(),
                            RbDate: date.getDate(),
                            RbMonth: date.getMonth(),
                            RbYear: date.getFullYear()
                        }
                    });
                }
            }

            yield put({type: TOGGLE_EDITOR, payload: true});
        } else {
            const date = new Date();
            yield put({
                type: SET_SELECTED_PERIOD, payload: {
                    Name: '',
                    ShortName: '',
                    Description: '',
                    TlCreationId: null,
                    TlPublicId: null,
                    LbEffDate: date.toLocaleDateString(),
                    LbDate: date.getDate(),
                    LbMonth: date.getMonth(),
                    LbYear: date.getFullYear(),
                    RbEffDate: date.toLocaleDateString(),
                    RbDate: date.getDate(),
                    RbMonth: date.getMonth(),
                    RbYear: date.getFullYear()
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

        const mappedPeriods = periods.map(period => ({
            ...period,
            startDate: period.LbDate,
            startMonth: period.LbMonth,
            startYear: period.LbYear,
            endDate: period.RbDate,
            endMonth: period.RbMonth,
            endYear: period.RbYear,
            StartDate: period.LbDate,
            StartMonth: period.LbMonth,
            StartYear: period.LbYear,
            EndDate: period.RbDate,
            EndMonth: period.RbMonth,
            EndYear: period.RbYear,
        }));

        yield put({type: SET_PERIODS, payload: mappedPeriods});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

const findPeriodBy = (paramsObj) => { //maybe add something else
    let _urlString = `/api/pm/period-list?${paramsObj}`;
    return commonGetQuery(_urlString);
};


const createPeriod = (period) => {
    const dateFrom = (period.startDate && period.startMonth && period.startYear) ? moment(`${period.startYear}-${period.startMonth}-${period.startDate}`) : null;
    const dateTo = (period.endDate && period.endMonth && period.endYear) ? moment(`${period.endYear}-${period.endMonth}-${period.endDate}`) : null;
    const periodData = {
        Name: period.name,
        TlCreationId: period.TlCreationId ? period.TlCreationId : period.tlCreationId,
        LbDate: dateFrom,
        RbDate: dateTo,
        LbYear: parseInt(period.startYear),
        LbMonth: parseInt(period.startMonth),
        RbMonth: parseInt(period.endMonth),
        RbYear: parseInt(period.endYear),
        ShortName: period.shortName,
        Description: period.description
    };

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
    const dateFrom = (period.startDate && period.startMonth && period.startYear) ? moment(`${period.startYear}-${period.startMonth}-${period.startDate}`) : null;
    const dateTo = (period.endDate && period.endMonth && period.endYear) ? moment(`${period.endYear}-${period.endMonth}-${period.endDate}`) : null;

    const periodData = {
        Id: period.Id,
        Name: period.name,
        TlCreationId: period.tlCreationId,
        LbDate: dateFrom,
        RbDate: dateTo,
        LbYear: period.startYear,
        LbMonth: period.startMonth,
        RbMonth: period.endMonth,
        RbYear: period.endYear,
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







