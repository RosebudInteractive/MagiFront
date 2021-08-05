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
import type {Message} from "../types/messages";
import $ from "jquery";
import {getOneTimeline} from "tt-ducks/timelines";
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
const CLOSE_EDITOR_WITH_CONFIRMATION = `${prefix}/CLOSE_EDITOR_WITH_CONFIRMATION`;

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
const ADD_TEMPORARY_PERIODS_REQUEST = `${prefix}/ADD_TEMPORARY_PERIODS_REQUEST`;
const SET_PERIODS_REQUEST = `${prefix}/SET_PERIODS_REQUEST`;

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
            return state.set('finded', [...payload]);
        case SET_TEMPORARY_PERIODS:
            return state.set('periods', [...payload]);
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

export const addTemporaryPeriod = (period) => {
    return {type: ADD_TEMPORARY_PERIODS_REQUEST, payload: period}
};

export const createPeriods = ({periods, timelineId}) => {
    return {type: CREATE_PERIODS, payload: {periods, timelineId}};
};

export const requestPeriods = () => {
    return {type: LOAD_PERIODS}
};

export const createNewPeriod = (period) => {
    return {type: CREATE_NEW_PERIOD, payload: period};
};

export const findPeriod = (data, timelineId) => {
    return {type: FIND_PERIOD, payload: {data, timelineId}}
};

export const setTemporaryPeriods = (data) => {
    return {type: SET_TEMPORARY_PERIODS, payload: data}
};

export const openPeriodEditor = ({periodId = null, timelineId = null, period = null, tableId = null}) => {
    return {type: OPEN_EDITOR, payload: {periodId, timelineId, period, tableId}}
};

export const toggleEditorTo = (isOn) => {
    return {type: TOGGLE_EDITOR, payload: isOn}
};

export const goBack = () => {
    return {type: GO_BACK}
};

export const updatePeriodData = ({periodId, periodData, tableId}) => {
    return {type: UPDATE_PERIOD, payload: {...periodData, Id: periodId, tableId: tableId}}
};

export const removePeriod = (id, timelineId) => {
    return {type: REMOVE_PERIOD, payload: {id, timelineId}}
};

export const setPeriods = (periods) => {
    return {type: SET_PERIODS_REQUEST, payload: periods}
};

export const cleanFound = () => {
    return {type: SET_FINDED, payload: []}
};

export const closeEditorWithConfirmation = () => {
    return {type: CLOSE_EDITOR_WITH_CONFIRMATION}
};

//sagas

export const saga = function* () {
    yield all([
        takeEvery(OPEN_EDITOR, openEditorSaga),
        takeEvery(SELECT_PERIOD, selectPeriodSaga),
        takeEvery(CLOSE_EDITOR_WITH_CONFIRMATION, closeEditorSaga),
        takeEvery(GO_BACK, goBackSaga),
        takeEvery(LOAD_PERIODS, getPeriodsSaga),
        takeEvery(CREATE_NEW_PERIOD, createPeriodSaga),
        takeEvery(UPDATE_PERIOD, updatePeriodSaga),
        takeEvery(REMOVE_PERIOD, removePeriodSaga),
        takeEvery(GET_PERIOD, getPeriodSaga),
        takeEvery(FIND_PERIOD, findPeriodSaga),
        takeEvery(CREATE_PERIODS, createPeriodsSaga),
        takeEvery(ADD_TEMPORARY_PERIODS_REQUEST, addTemporaryPeriodSaga),
        takeEvery(SET_PERIODS_REQUEST, setPeriodsSaga),
    ])
};

const _getColor = () => { //todo add to helpers/tools
    return "hsl(" + 360 * Math.random() + ',' +
        (55 + 45 * Math.random()) + '%,' +
        (50 + 10 * Math.random()) + '%)'
};

function* closeEditorSaga() {
    try {
        const message: Message = {
            content: `Закрыть без сохранения изменений?`,
            title: "Подтверждение"
        };

        yield put(showUserConfirmation(message));

        const {accept} = yield race({
            accept: take(MODAL_MESSAGE_ACCEPT),
            decline: take(MODAL_MESSAGE_DECLINE)
        });

        if (!accept) return;

        yield put(toggleEditorTo(false));
    } catch (e) {
        console.log(e.toString())
    }
}

function* setPeriodsSaga({payload}) {

    console.log('setPeriodsSaga');
    const _periods = payload.map((item) => {
        let _period = {...item};

        _period.startDate = item.LbDate ? new Date(item.LbDate).toLocaleDateString("ru-Ru") :
            `${item.LbMonth ? item.LbMonth + '.' : ''}${item.LbYear}`;
        _period.endDate = item.RbDate ? new Date(item.RbDate).toLocaleDateString("ru-Ru") :
            `${item.RbMonth ? item.RbMonth + '.' : ''}${item.RbYear}`;
        _period.name = item.Name;
        _period.color = _getColor();

        _period.DisplayStartDate = item.LbYear ? `${item.LbDay ? 
            item.LbDay.toString().padStart(2, '0') + '.' : ''}${item.LbMonth ? 
            item.LbMonth.toString().padStart(2, '0') + '.' : ''}${item.LbYear}` :
            '--'
        ;
        _period.DisplayEndDate = item.RbYear ? `${item.RbDay ?
            item.RbDay.toString().padStart(2, '0') + '.' : ''}${item.RbMonth ?
            item.RbMonth.toString().padStart(2, '0') + '.' : ''}${item.RbYear}` :
            '--'
        ;

        return _period;
    });

    yield put({
        type: SET_PERIODS, payload: _periods.map(pr => ({
            ...pr,
            DisplayStartDate: pr.DisplayStartDate !== undefined ? pr.DisplayStartDate : '--',
            DisplayEndDate: pr.DisplayEndDate !== undefined ? pr.DisplayEndDate : '--'
        }))
    })
}

function* addTemporaryPeriodSaga({payload}) {
    const _periods = yield select(temporaryPeriodsSelector);
    yield put({type: SET_PERIODS_REQUEST, payload: [..._periods, payload]});
}

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

        if (data.payload.data) {
            paramsObject.Year = data.payload.data.Year;
            paramsObject.Month = data.payload.data.Month;
            paramsObject.Day = data.payload.data.Day;
            paramsObject.Name = data.payload.data.Name;
            paramsObject.ExcTimelineId = data.payload.timelineId;
        }

        const response = yield call(findPeriodBy, $.param(paramsObject));

        yield put({type: SET_FINDED, payload: response.map(el => {

            return {
                ...el,
                DisplayStartDate:  el.LbYear ? `${el.LbDay ?
                    el.LbDay.toString().padStart(2, '0') + '.' : ''}${el.LbMonth ?
                    el.LbMonth.toString().padStart(2, '0') + '.' : ''}${el.LbYear}` :
                    '-13',
                DisplayEndDate:  el.RbYear ? `${el.RbDay ?
                    el.RbDay.toString().padStart(2, '0') + '.' : ''}${el.RbMonth ?
                    el.RbMonth.toString().padStart(2, '0') + '.' : ''}${el.RbYear}` :
                    '-34'
            }
            })});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        showErrorMessage(e.message);
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
        yield put(showErrorMessage(e.message));
    }
}

function* removePeriodSaga(data) {
    const message: Message = {
        content: `Удалить период #${data.payload.id}?`,
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

        const res = yield call(deletePeriod, data.payload.id, data.payload.timelineId);

        yield put({type: SUCCESS_REQUEST});
        yield put(getOneTimeline({id: data.payload.timelineId, setToEditor: true}))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.toString()));
    }
}

function* updatePeriodSaga(data) {
    try {
        if (data.payload.Id) {
            yield put({type: START_REQUEST});

            yield call(updatePeriod, data.payload);

            yield put({type: SUCCESS_REQUEST});
        }


        const periods = yield select(periodsSelector);
        const periodToUpdateIndex = data.payload.tableId ? periods.findIndex(ev => ev.id === data.payload.tableId) : periods.findIndex(ev => ev.Id === data.payload.Id);
        const periodToUpdate = periods[periodToUpdateIndex];

        // let updateDataEvent;

        if (periodToUpdate) {
            const dateFrom = (data.payload.StartDay && data.payload.StartMonth && data.payload.StartYear) ? moment(`${data.payload.StartYear}-${data.payload.StartMonth}-${data.payload.StartDay}`) : null;
            const dateTo = (data.payload.EndDay && data.payload.EndMonth && data.payload.EndYear) ? moment(`${data.payload.EndYear}-${data.payload.EndMonth}-${data.payload.EndDay}`) : null;
            const updateDataPeriod = {
                ...periodToUpdate, Id: data.payload.Id,
                Name: data.payload.Name,
                TlCreationId: data.payload.TlCreationId,
                LbDate: dateFrom,
                RbDate: dateTo,
                LbYear: parseInt(data.payload.StartYear),
                LbMonth: parseInt(data.payload.StartMonth),
                RbMonth: parseInt(data.payload.EndMonth),
                RbYear: parseInt(data.payload.EndYear),
                ShortName: data.payload.ShortName,
                Description: data.payload.Description,
                StartDay: parseInt(data.payload.StartDay),
                EndDay: parseInt(data.payload.EndDay),
                StartYear: parseInt(data.payload.StartYear),
                EndYear: parseInt(data.payload.EndYear),
                StartMonth: parseInt(data.payload.StartMonth),
                EndMonth: parseInt(data.payload.EndMonth),
            };

            periods.splice(periodToUpdateIndex, 1, updateDataPeriod);

            yield put(setPeriods([...periods]));
        }
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message));
    }
}

function* createPeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const {id} = yield call(createPeriod, data.payload);

        yield put({type: SUCCESS_REQUEST});
        yield put(addTemporaryPeriod({
            ...data.payload,
            DisplayStartDate:
                data.payload.LbDate ? new Date(data.payload.LbDate).toLocaleDateString("ru-Ru") :
                    data.payload.StartDate ? new Date(data.payload.StartDate).toLocaleDateString("ru-Ru") :
                        `${data.payload.StartDay ? data.payload.StartDay.toString().padStart(2, '0') + '.' : ''}${data.payload.StartMonth ? data.payload.StartMonth.toString().padStart(2, '0') + '.' : ''}${data.payload.StartYear}`,

            DisplayEndDate: data.payload.RbDate ? new Date(data.payload.RbDate).toLocaleDateString("ru-Ru") :
                data.payload.EndDate ? new Date(data.payload.EndDate).toLocaleDateString("ru-Ru") :
                    `${data.payload.EndDay ? data.payload.EndDay.toString().padStart(2, '0') + '.' : ''}${data.payload.EndMonth ? data.payload.EndMonth.toString().padStart(2, '0') + '.' : ''}${data.payload.EndYear}`,
            Id: id,
            State: 1
        }))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message));
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

                if (data.payload.timelineId) {
                    yield put({
                        type: SET_SELECTED_PERIOD, payload: {
                            Name: '',
                            ShortName: '',
                            Description: '',
                            TlCreationId: data.payload.timelineId,
                            TlPublicId: null,
                            StartDate: null,
                            StartYear: null,
                            EndYear: null,
                            EndDate: null,
                            StartMonth: null,
                            EndMonth: null,
                            DisplayStartDate: null,
                            DisplayEndDate: null,
                            LbEffDate: null,
                            LbDate: null,
                            LbMonth: null,
                            LbYear: null,
                            RbEffDate: null,
                            RbDate: null,
                            RbMonth: null,
                            RbYear: null,
                            StartDay: null,
                            EndDay: null,
                            State: 1
                        }
                    });
                }
            }

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

        yield put({type: SET_PERIODS_REQUEST, payload: periods});
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
    const dateFrom = (period.LbDay && period.LbMonth && period.LbYear) ? moment(`${period.LbYear}-${period.LbMonth}-${period.LbDay}`) : null;
    const dateTo = (period.RbDay && period.RbMonth && period.RbYear) ? moment(`${period.RbYear}-${period.RbMonth}-${period.RbDay}`) : null;
    dateFrom && dateFrom.set('year', period.StartYear);
    dateTo && dateTo.set('year', period.EndYear);
    const periodData = {
        Name: period.Name,
        TlCreationId: period.TlCreationId,
        LbDate: dateFrom,
        RbDate: dateTo,
        LbYear: parseInt(period.LbYear),
        LbMonth: parseInt(period.LbMonth),
        RbMonth: parseInt(period.RbMonth),
        RbYear: parseInt(period.RbYear),
        LbDay: parseInt(period.LbDay),
        RbDay: parseInt(period.RbDay),
        ShortName: period.ShortName,
        Description: period.Description
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
    const dateFrom = (period.LbDay && period.LbMonth && period.LbYear) ? moment(`${period.LbYear}-${period.LbMonth}-${period.LbDay}`) : null;
    const dateTo = (period.RbDay && period.RbMonth && period.RbYear) ? moment(`${period.RbYear}-${period.RbMonth}-${period.RbDay}`) : null;
    dateFrom && dateFrom.set('year', period.StartYear);
    dateTo && dateTo.set('year', period.EndYear);

    const periodData = {
        Id: period.Id,
        Name: period.Name,
        TlCreationId: period.TlCreationId,
        LbDate: dateFrom,
        RbDate: dateTo,
        LbYear: parseInt(period.LbYear),
        LbMonth: parseInt(period.LbMonth),
        RbMonth: parseInt(period.RbMonth),
        RbYear: parseInt(period.RbYear),
        ShortName: period.ShortName,
        Description: period.Description
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

const deletePeriod = (id, timelineId) => {
    return fetch(`/api/pm/period/${id}`, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({timelineId: timelineId})
    })
        .then(checkStatus)
        .then(parseJSON)
};

const getPeriods = (params) => {
    let _urlString = `/api/pm/period-list${params ? `?${params}` : ''}`;
    return commonGetQuery(_urlString);
};

const getPeriod = (id) => {
    return commonGetQuery(`/api/pm/period/${id}`);
};







