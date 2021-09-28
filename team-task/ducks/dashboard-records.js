import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, filterSelector, paramsSelector} from "tt-ducks/route";
import {commonGetQuery} from "tools/fetch-tools";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import _ from "lodash";
import moment from "moment";
import {DASHBOARD_ELEMENTS_STATE} from "../constants/states";
import $ from "jquery";

export const moduleName = 'dashboard-records';
const prefix = `${appName}/${moduleName}`;

const SET_RECORDS = `${prefix}/SET_RECORDS`;
const LOAD_DASHBOARD_RECORDS = `${prefix}/LOAD_DASHBOARD_RECORDS`;
const LOAD_UNPUBLISHED_RECORDS = `${prefix}/LOAD_UNPUBLISHED_RECORDS`;
const CHANGE_RECORD = `${prefix}/CHANGE_RECORD`;

const CHANGE_VIEW_MODE = `${prefix}/CHANGE_VIEW_MODE`;

const SET_FIELDS = `${prefix}/SET_FIELDS`;
const SET_DISPLAY_RECORDS = `${prefix}/SET_DISPLAY_RECORDS`;
const SET_UNPUBLISHED_RECORDS = `${prefix}/SET_UNPUBLISHED_RECORDS`;
const SET_ALL_UNPUBLISHED_RECORDS = `${prefix}/SET_ALL_UNPUBLISHED_RECORDS`;
const SET_VIEW_MODE = `${prefix}/SET_VIEW_MODE`;

const REQUEST_START = `${prefix}/REQUEST_START`;
const REQUEST_SUCCESS = `${prefix}/REQUEST_SUCCESS`;
const REQUEST_FAIL = `${prefix}/REQUEST_FAIL`;

const TOGGLE_MODAL_DND_TO_PUBLISH = `${prefix}/TOGGLE_MODAL_DRAG_N_DROP_TO_PUBLISH`;
const OPEN_MODAL_DND_TO_PUBLISH = `${prefix}/OPEN_MODAL_DND_TO_PUBLISH`;
const CLOSE_MODAL_DND_TO_PUBLISH = `${prefix}/CLOSE_MODAL_DND_TO_PUBLISH`;
const PUBLISH_RECORD = `${prefix}/PUBLISH_RECORD`;
// const SET_FILTER_FOR_UNPUBLISHED = `${prefix}/SET_FILTER_FOR_UNPUBLISHED`;
// const SET_FILTER_VALUES_UNPUBLISHED = `${prefix}/SET_FILTER_VALUES_UNPUBLISHED`;
const SET_FILTER_UNPUBLISHED = `${prefix}/SET_FILTER_UNPUBLISHED`;
const ADD_TO_DISPLAYED_RECORDS = `${prefix}/ADD_TO_DISPLAYED_RECORDS`;
const CHANGE_DISPLAYED_RECORD = `${prefix}/CHANGE_DISPLAYED_RECORD`;
const SET_NEW_DISPLAYED_RECORDS = `${prefix}/SET_NEW_DISPLAYED_RECORDS`;
const SET_SELECTED_RECORD_DATA = `${prefix}/SET_SELECTED_RECORD_DATA`;


const defaultFieldSet = new Set([]);

export const VIEW_MODE = {
    WEEK: 0,
    DAY: 1,
    COMPACT: 2,
};

export const ReducerRecord = Record({
    records: [],
    fieldSet: defaultFieldSet,
    displayRecords: defaultFieldSet,
    unpublishedRecords: [],
    allUnpublishedRecords: [],
    filterUnpublished: [],
    fetching: false,
    viewMode: VIEW_MODE.WEEK,
    showModalOfPublishing: false,
    selectedRecord: null
});

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case REQUEST_START:
            return state.set('fetching', true);
        case REQUEST_SUCCESS:
        case REQUEST_FAIL:
            return state.set('fetching', false);
        case SET_RECORDS:
            return state.set('records', [...payload]);
        case SET_DISPLAY_RECORDS:
            return state.set('displayRecords', [...payload]);
        case SET_FIELDS:
            return state.set('fieldSet', payload);
        case SET_VIEW_MODE:
            return state.set('viewMode', payload);
        case SET_UNPUBLISHED_RECORDS:
            return state.set('unpublishedRecords', payload);
        case SET_ALL_UNPUBLISHED_RECORDS:
            return state.set('allUnpublishedRecords', payload);
        case TOGGLE_MODAL_DND_TO_PUBLISH:
        case CLOSE_MODAL_DND_TO_PUBLISH:
        case OPEN_MODAL_DND_TO_PUBLISH:
            return state.set('showModalOfPublishing', payload);
        case SET_FILTER_UNPUBLISHED:
            return state.set('filterUnpublished', payload);
        case SET_SELECTED_RECORD_DATA:
            return state.set('selectedRecord', payload);
        case SET_NEW_DISPLAYED_RECORDS:
            return state.set('displayRecords', [...payload]);
        default:
            return state
    }
}

const stateSelector = state => state[moduleName];

export const recordsSelector = createSelector(stateSelector, state => state.records);
export const displayRecordsSelector = createSelector(stateSelector, state => state.displayRecords);
export const unpublishedRecordsSelector = createSelector(stateSelector, state => state.unpublishedRecords);
export const allUnpublishedRecordsSelector = createSelector(stateSelector, state => state.allUnpublishedRecords);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);
export const elementsFieldSetSelector = createSelector(stateSelector, state => state.fieldSet);
export const modeSelector = createSelector(stateSelector, state => state.viewMode);
export const modalPublishIsOnSelector = createSelector(stateSelector, state => state.showModalOfPublishing);
export const filterUnpublishedSelector = createSelector(stateSelector, state => state.filterUnpublished);
export const selectedRecordSelector = createSelector(stateSelector, state => state.selectedRecord);


export const addToDisplayedRecords = (id, newRecord) => {
    return {type: ADD_TO_DISPLAYED_RECORDS, payload: {id, newRecord}};
};

export const getRecords = () => {
    return {type: LOAD_DASHBOARD_RECORDS};
};

export const getUnpublishedRecords = (params = null) => {
    return {type: LOAD_UNPUBLISHED_RECORDS, payload: params};
};

export const setPublishRecordDate = ({isoDateString, lessonId}) => {
    return {type: PUBLISH_RECORD, payload: {isoDateString, lessonId}};
};

export const changePublishRecordDate = (id, newRecord) => {
    return {type: CHANGE_DISPLAYED_RECORD, payload: {id, newRecord}};
};

export const toggleModalDndToPublish = (isOn) => {
    return {type: TOGGLE_MODAL_DND_TO_PUBLISH, payload: isOn};
};

export const openModalDndToPublish = () => {
    return {type: OPEN_MODAL_DND_TO_PUBLISH, payload: true};
};

export const closeModalDndToPublish = () => {
    return {type: CLOSE_MODAL_DND_TO_PUBLISH, payload: false};
};

export const changeViewMode = (mode, params) => {
    return {type: CHANGE_VIEW_MODE, payload: {mode, params}}
};

export const setFilterUnpublished = (filterValues) => {
    return {type: SET_FILTER_UNPUBLISHED, payload: filterValues}
};

export const setSelectedRecord = (data) => {
    return {type: SET_SELECTED_RECORD_DATA, payload: data}
}

export const saga = function* () {
    yield all([
        takeEvery(LOAD_DASHBOARD_RECORDS, getRecordsSaga),
        takeEvery(LOAD_UNPUBLISHED_RECORDS, getUnpublishedRecordsSaga),
        takeEvery(CHANGE_RECORD, updateRecordSaga),
        takeEvery(CHANGE_VIEW_MODE, changeViewModeSaga),
        takeEvery(PUBLISH_RECORD, publishRecordSaga),
        takeEvery(ADD_TO_DISPLAYED_RECORDS, addToDisplayedRecordsSaga),
        takeEvery(CHANGE_DISPLAYED_RECORD, changeDisplayedRecordsSaga)
    ])
};

function* addToDisplayedRecordsSaga(data) {
    try {
        const displayedRecords = yield select(displayRecordsSelector);

        const index = displayedRecords.findIndex(record => record.id === data.payload.id);

        if (index !== -1) {
            if (displayedRecords[index].CourseName.length < 1) {
                displayedRecords[index] = data.payload.newRecord;
            } else {
                displayedRecords.splice(index, 0, data.payload.newRecord);
            }
        }

        yield put({type: SET_NEW_DISPLAYED_RECORDS, payload: displayedRecords});

    } catch (e) {
        showErrorMessage(e.toString())
    }
}

function* changeDisplayedRecordsSaga(data) {
    try {
        const displayedRecords = yield select(displayRecordsSelector);
        const oldIndex = displayedRecords.findIndex((record) => record.id === data.payload.id);
        const newIndex = displayedRecords.findIndex((record, ind) => record.DateObject.isSame(data.payload.newRecord.DateObject) && ind !== oldIndex);


        if (newIndex !== -1) {

            const newRecordData = {...data.payload.newRecord, id: displayedRecords[newIndex].id,
                Week: displayedRecords[newIndex].Week,
                IsEndOfWeek: displayedRecords[newIndex].IsEndOfWeek,
                PubDate: displayedRecords[newIndex].PubDate,
                IsEven: displayedRecords[newIndex].IsEven
            };

            if (displayedRecords[newIndex].CourseName.length < 1) {
                displayedRecords[newIndex] = newRecordData;
            } else {
                displayedRecords.splice(newIndex, 0, newRecordData);
            }

            displayedRecords[oldIndex] = {
                id: displayedRecords[oldIndex].id,
                Week: displayedRecords[oldIndex].Week,
                IsEndOfWeek: displayedRecords[oldIndex].IsEndOfWeek,
                PubDate: displayedRecords[oldIndex].PubDate,
                IsEven: displayedRecords[oldIndex].IsEven,
                $css: displayedRecords[oldIndex].$css,
                CourseId: null,
                CourseName: "",
                LessonId: null,
                LessonNum: "",
                CourseLessonName: ['', ''],
                LessonName: "",
                Elements: [],
                IsPublished: null,
                ProcessId: null,
                ProcessState: null
            };
        }

        yield put({type: SET_NEW_DISPLAYED_RECORDS, payload: displayedRecords});

    } catch (e) {
        showErrorMessage(e.toString())
    }
}

function* publishRecordSaga(data) {
    try {
        yield put({type: REQUEST_START});

        const res = yield call(setDateToPublication,
            {
                ReadyDate: data.payload.isoDateString,
                lessonId: data.payload.lessonId
            });

        // yield put(getRecords());
        const filterValues = yield select(filterUnpublishedSelector);
        yield put(getUnpublishedRecords(filterValues));

        yield put({type: REQUEST_SUCCESS});
    } catch (e) {
        yield put({type: REQUEST_FAIL});
        showErrorMessage(e)
    }
}

function* getUnpublishedRecordsSaga(data) {
    try {
        yield put({type: REQUEST_START});

        const filter = yield select(filterUnpublishedSelector);

        const objectParams = {};

        if (filter) {
            if (filter.course_name_unpublished) {
                objectParams.course_name = filter.course_name_unpublished
            }
            if (filter.lesson_name_unpublished) {
                objectParams.lesson_name = filter.lesson_name_unpublished
            }
        }

        const params = $.param(objectParams);

        const paramsToRequest = (data && data.payload) ? data.payload : params;

        const unpublishedRecords = yield call(getUnpublishedRecordsReq, paramsToRequest);

        yield put({type: SET_UNPUBLISHED_RECORDS, payload: unpublishedRecords});
        yield put({type: REQUEST_SUCCESS});

    } catch (e) {
        yield put({type: REQUEST_FAIL});
        showErrorMessage(e.toString())
    }
}

function* changeViewModeSaga(data) {
    try {
        yield put({type: SET_VIEW_MODE, payload: +data.payload.mode});
        const dates = yield select(filterSelector);
        const records = _.cloneDeep(yield select(recordsSelector));

        let resultArray = handleServerData(records, +data.payload.mode, dates.st_date ? dates.st_date : data.payload.st_date, dates.fin_date ? dates.fin_date : data.payload.fin_date);

        yield put({type: SET_DISPLAY_RECORDS, payload: resultArray});
    } catch (e) {
        showErrorMessage(e.toString())
    }
}

const handleServerData = (records, mode, stDate = null, finDate = null) => {
    const currentDate = moment().locale('ru');
    const defaultStartDate = currentDate.toISOString();
    const defaultEndDate = currentDate.add(6, 'days').toISOString();

    const sDate = records.length > 0 ? records[0].PubDate : null;
    const eDate = records.length > 1 ? records[records.length - 1].PubDate : null;

    let startDate;
    let finishDate;
    if (!stDate && !finDate) {
        if (sDate && eDate) {
            startDate = moment(sDate);
            finishDate = moment(eDate);
        } else {
            startDate = moment(defaultStartDate);
            finishDate = moment(defaultEndDate);
        }
    } else {
        startDate = moment(stDate);
        finishDate = moment(finDate);
    }

    const daysBetween = finishDate.diff(startDate, "days");

    const resultArray = [];
    let week = 0,
        displayWeekRange = '',
        isEven = true;

    for (let i = 0; i <= daysBetween; i++) {
        let currentDate = moment(startDate).add(i, 'days'),
            currentWeek = currentDate.isoWeek();

        const weekHasChanged = currentWeek !== week
        if ((mode === VIEW_MODE.WEEK) && week && weekHasChanged) {
            isEven = !isEven;
        }

        if (weekHasChanged) {
            const clonedDate = currentDate.clone().locale('ru');
            displayWeekRange = `${clonedDate.startOf('week').format('DD/MM')} - ${clonedDate.endOf('week').format('DD/MM')}`;
            week = currentWeek;
        }

        const filteredRecords = records.filter(rec => moment(rec.PubDate).isSame(currentDate, 'day'));

        if (filteredRecords.length) {
            const [first, ...other] = filteredRecords;
            first.Week = weekHasChanged ? displayWeekRange : '';
            first.DateObject = moment(first.PubDate).locale('ru'); //todo check it
            first.IsEven = isEven;
            first.IsEndOfWeek = moment(first.PubDate).locale('ru').isoWeekday() === 7 && other.length === 0;
            first.CourseLessonName = [first.CourseName, first.LessonName];
            first.PubDate = moment(first.PubDate).locale('ru').format('DD MMM');

            first.Elements.forEach((elem) => {
                const _state = Object.values(DASHBOARD_ELEMENTS_STATE).find(item => item.value === elem.State);

                first[elem.Name] = _state ? {css: _state.css, label: _state.label, question: elem.HasAlert} : {
                    css: "",
                    label: "--",
                    question: false
                };
            });

            if (other && other.length > 0) {
                other.forEach((item, index) => {
                    item.Week = '';
                    item.PubDate = '';
                    item.IsEven = isEven;
                    item.IsEndOfWeek = moment(currentDate).set({
                        hour: 0,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    }).isoWeekday() === 7 && index === other.length - 1;
                    item.CourseLessonName = [item.CourseName, item.LessonName];
                    item.DateObject = currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});

                    item.Elements.forEach((elem) => {
                        const _state = Object.values(DASHBOARD_ELEMENTS_STATE).find(st => st.value === elem.State);
                        item[elem.Name] = _state ? {css: _state.css, label: _state.label, question: elem.HasAlert} : {
                            css: "_unknown",
                            label: "",
                            question: false
                        };
                    })
                });
            }

            resultArray.push(first, ...other);

            if (mode === VIEW_MODE.COMPACT) {
                isEven = !isEven;
            }

        } else {
            if (mode === VIEW_MODE.COMPACT) {
                continue;
            }
            const objectData = {
                IsEven: isEven,
                PubDate: currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0}).locale('ru').format('DD MMM'),
                DateObject: currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0}).locale('ru'), //todo check it
                CourseId: null,
                IsEndOfWeek: currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0}).isoWeekday() === 7,
                CourseName: "",
                LessonId: null,
                Week: weekHasChanged ? displayWeekRange : '',
                LessonNum: "",
                CourseLessonName: ['', ''],
                LessonName: "",
                Elements: [],
                IsPublished: null,
                ProcessId: null,
                ProcessState: null
            };

            resultArray.push(objectData);
        }

        if (mode === VIEW_MODE.DAY) {
            isEven = !isEven;
        }
    }

    return resultArray;
};

function* getRecordsSaga() {
    yield put({type: REQUEST_START});
    try {
        const mode = yield select(modeSelector),
            params = yield select(paramsSelector),
            filter = yield select(filterSelector);

        const cleanedParams = new URLSearchParams(params);
        cleanedParams.delete('CourseNameUnpublished');
        cleanedParams.delete('LessonNameUnpublished');

        const records = yield call(getRecordsReq, cleanedParams);

        yield put({
            type: SET_RECORDS,
            payload: records
        });

        const fields = new Set();
        records.forEach(rec => {
            if (rec.Elements && Array.isArray(rec.Elements)) {
                rec.Elements.forEach(el => fields.add(el.Name))
            }
        });

        const fieldSet = [];

        Array.from(fields).forEach((el, inx) => {
            const fieldObj = {id: el};
            fieldObj.header = [{text: el, css: 'up-headers'}];

            fieldObj.css = '_container element-style';
            fieldObj.minWidth = 75;
            fieldObj.template = function (val) {
                const elData = val[el];

                if (elData) {
                    return `<div style="width: -webkit-fill-available; justify-content: center;align-items: center;display: flex;"><div class="state-template-block-dr ${elData.css} ">${elData.label}<div class="${elData.question ? 'question' : ''}">${elData.question ? '?' : ''}</div></div></div></div>`;
                } else {
                    return `<div class="state-template-block-dr _unknown"></div>`
                }
            };

            fieldSet.push(fieldObj)
        });

        yield put({type: SET_FIELDS, payload: fieldSet});
        yield put({type: REQUEST_SUCCESS});

        const startDate = filter.st_date ? filter.st_date : moment().toISOString();

        const finishDate = (filter.fin_date) ? filter.fin_date : moment(startDate).add(6, 'days').toISOString();

        yield put({
            type: CHANGE_VIEW_MODE,
            payload: {
                mode: mode,
                st_date: startDate,
                fin_date: finishDate
            }
        });

        yield put(clearLocationGuard());
    } catch
        (e) {
        yield put({type: REQUEST_FAIL});
        yield put(clearLocationGuard());


        yield put(showErrorMessage(e.message));

    }
}

function* updateRecordSaga(data) {
    yield put({type: REQUEST_START});

    try {
        const newRecord = yield call(updateRecordReq, data.payload);
        const records = yield select(recordsSelector);
        const oldRecordIndex = records.findIndex(rec => rec.Id === newRecord.Id);
        const newRecords = oldRecordIndex !== -1 ? records.splice(oldRecordIndex, 1, newRecord) : records;

        yield put({type: SET_RECORDS, payload: newRecords});
        yield put({type: REQUEST_SUCCESS});
    } catch (e) {
        yield put({type: REQUEST_FAIL});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

const setDateToPublication = ({ReadyDate, lessonId}) => {
    return fetch(`/api/pm/dashboard/lesson/${lessonId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ReadyDate}),
        credentials: 'include'
    }).then(checkStatus)
        .then(parseJSON);
};

const getRecordsReq = (params) => {
    let urlString = `/api/pm/dashboard${params ? `?${params}` : ''}`;
    return commonGetQuery(urlString);
};

const getUnpublishedRecordsReq = (params) => {
    let urlString = `/api/pm/dashboard/lesson-list${params && params.toString().length ? `?${params}` : ''}`;
    return commonGetQuery(urlString);
};


const updateRecordReq = (record) => { //todo change url later
    return fetch(`/some/url`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(record),
        credentials: 'include'
    }).then(checkStatus)
        .then(parseJSON);
};
