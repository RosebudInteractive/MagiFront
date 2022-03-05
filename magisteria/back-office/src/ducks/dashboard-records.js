import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, filterSelector, paramsSelector} from "tt-ducks/route";
import {checkStatus, parseJSON, commonGetQuery} from "#common/tools/fetch-tools";
import _ from "lodash";
import moment from "moment";
import {ELEMENT_STATE} from "../constants/states";
import $ from "jquery";

export const moduleName = 'dashboard-records';
const prefix = `${appName}/${moduleName}`;

const SET_RECORDS = `${prefix}/SET_RECORDS`;
const LOAD_DASHBOARD_RECORDS = `${prefix}/LOAD_DASHBOARD_RECORDS`;
const LOAD_UNPUBLISHED_RECORDS = `${prefix}/LOAD_UNPUBLISHED_RECORDS`;

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
const SET_FILTER_UNPUBLISHED = `${prefix}/SET_FILTER_UNPUBLISHED`;
const ADD_TO_DISPLAYED_RECORDS = `${prefix}/ADD_TO_DISPLAYED_RECORDS`;
const CHANGE_DISPLAYED_RECORD = `${prefix}/CHANGE_DISPLAYED_RECORD`;
const SET_NEW_DISPLAYED_RECORDS = `${prefix}/SET_NEW_DISPLAYED_RECORDS`;
const SET_SELECTED_RECORD_DATA = `${prefix}/SET_SELECTED_RECORD_DATA`;
const SET_FILTER_COURSE_OPTIONS = `${prefix}/SET_FILTER_COURSE_OPTIONS`;
const GET_FILTER_OPTIONS_REQUEST = `${prefix}/GET_FILTER_OPTIONS_REQUEST`;
const SET_RECORDS_DATERANGE = `${prefix}/SET_RECORDS_DATERANGE`;

const RELOAD_RECORDS = `${prefix}/RELOAD_RECORDS`;
const SET_CHANGED_RECORDS = `${prefix}/SET_CHANGED_RECORDS`;
const GET_UNPUBLISHED_LESSONS = `${prefix}/GET_UNPUBLISHED_LESSONS`;
const SET_UNPUBLISHED_LESSONS = `${prefix}/SET_UNPUBLISHED_LESSONS`;
const GET_PROCESS_FOR_LESSON = `${prefix}/GET_PROCESS_FOR_LESSON`;
const SET_ADDITIONAL_INFO = `${prefix}/SET_ADDITIONAL_INFO`;
const REMOVE_FROM_PUBLISHED = `${prefix}/REMOVE_FROM_PUBLISHED`;


const FIELDS_SORT_OBJECT_ORDER = {
    'Звук': 1,
    'Транскрипт': 2,
    'Иллюстрации': 3,
    'Техническая стенограмма': 4,
    'Список литературы': 5,
    'Готовые компоненты': 6
};


const defaultFieldSet = new Set([]);

export const VIEW_MODE = {
    WEEK: 0,
    DAY: 1,
    COMPACT: 2,
};

export const ReducerRecord = Record({
    records: [],
    changedRecords: [],
    fieldSet: defaultFieldSet,
    displayRecords: defaultFieldSet,
    unpublishedRecords: [],
    allUnpublishedRecords: [],
    filterUnpublished: [],
    coursesForUnpublishedFilter: [],
    dateRangeString: '',
    unpublishedLessons: [],
    fetching: false,
    viewMode: VIEW_MODE.WEEK,
    showModalOfPublishing: false,
    selectedRecord: null,
    additionalInfo: {lessonsCount: 0, additionalEpisodesCount: 0, allCount: 0}
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
        case SET_CHANGED_RECORDS:
            return state.set('changedRecords', [...payload]);
        case SET_FILTER_COURSE_OPTIONS:
            return state.set('coursesForUnpublishedFilter', [...payload]);
        case SET_RECORDS_DATERANGE:
            return state.set('dateRangeString', payload);
        case SET_UNPUBLISHED_LESSONS:
            return state.set('unpublishedLessons', payload);
        case SET_ADDITIONAL_INFO:
            return state.set('additionalInfo', payload);
        default:
            return state
    }
}

const stateSelector = state => state[moduleName];

export const recordsSelector = createSelector(stateSelector, state => state.records);
export const recordsChangedSelector = createSelector(stateSelector, state => state.changedRecords);
export const displayRecordsSelector = createSelector(stateSelector, state => state.displayRecords);
export const unpublishedRecordsSelector = createSelector(stateSelector, state => state.unpublishedRecords);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);
export const elementsFieldSetSelector = createSelector(stateSelector, state => state.fieldSet);
export const modeSelector = createSelector(stateSelector, state => state.viewMode);
export const modalPublishIsOnSelector = createSelector(stateSelector, state => state.showModalOfPublishing);
export const filterUnpublishedSelector = createSelector(stateSelector, state => state.filterUnpublished);
export const selectedRecordSelector = createSelector(stateSelector, state => state.selectedRecord);
export const courseOptionsUnpublishedFilter = createSelector(stateSelector, state => state.coursesForUnpublishedFilter);
export const displayRecordsDateRangeString = createSelector(stateSelector, state => state.dateRangeString);
export const unpublishedLessons = createSelector(stateSelector, state => state.unpublishedLessons);
export const additionalInfoSelector = createSelector(stateSelector, state => state.additionalInfo);


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

export const getCourseFilterOptions = () => {
    return {type: GET_FILTER_OPTIONS_REQUEST}
};

export const setRecordsDateRange = (stringDaterange) => {
    return {type: SET_RECORDS_DATERANGE, payload: stringDaterange}
};

export const getDashboardUnpublishedLessons = () => {
    return {type: GET_UNPUBLISHED_LESSONS}
};

export const removeFromPublished = (record) => {
   return {type: REMOVE_FROM_PUBLISHED, payload: record}
}

export const saga = function* () {
    yield all([
        takeEvery(LOAD_DASHBOARD_RECORDS, getRecordsSaga),
        takeEvery(LOAD_UNPUBLISHED_RECORDS, getUnpublishedRecordsSaga),
        takeEvery(CHANGE_VIEW_MODE, changeViewModeSaga),
        takeEvery(PUBLISH_RECORD, publishRecordSaga),
        takeEvery(ADD_TO_DISPLAYED_RECORDS, addToDisplayedRecordsSaga),
        takeEvery(CHANGE_DISPLAYED_RECORD, changeDisplayedRecordsSaga),
        takeEvery(RELOAD_RECORDS, reloadRecordsSaga),
        takeEvery(GET_FILTER_OPTIONS_REQUEST, getCourseFilterCourseOptionsSaga),
        takeEvery(GET_UNPUBLISHED_LESSONS, getUnpublishedLessonsSaga),
        takeEvery(REMOVE_FROM_PUBLISHED, removeRecordFromPublishedSaga),
    ])
};

function* getUnpublishedLessonsSaga() {
    try {
        yield put({type: REQUEST_START});
        const records = yield call(getUnpublishedLessonsReq);
        yield put({type: SET_UNPUBLISHED_LESSONS, payload: records});
        yield put({type: REQUEST_SUCCESS});
    }catch (e) {
        yield put({type: REQUEST_FAIL});
        showErrorMessage(e.toString())
    }
}

function* getCourseFilterCourseOptionsSaga() {
    try {
        yield put({type: REQUEST_START});
        const courses =yield call(getCoursesForFilter);

        yield put({type: SET_FILTER_COURSE_OPTIONS, payload: courses});
    } catch (e) {
        showErrorMessage(e.toString())
    }
}

function* addToDisplayedRecordsSaga(data) {
    try {
        const mode = yield select(modeSelector);
        const newRecord = data.payload.newRecord;

        const resSetDate = yield call(setDateToPublication, {
            ReadyDate: newRecord.DateObject.toISOString(),
            lessonId: newRecord.LessonId
        });

        if (resSetDate && resSetDate.result === 'OK') {
            const dates = yield select(filterSelector);
            const records = _.cloneDeep(yield select(recordsChangedSelector));

            const currentDate = moment().locale('ru');
            const defaultStartDate = currentDate.toISOString();
            const defaultEndDate = currentDate.add(1, 'months').toISOString();

            const savedRecord = yield call(getRecordByLesson, newRecord.LessonId);

            if(savedRecord) {
                records.push({
                    PubDate: newRecord.DateObject.toISOString(),
                    CourseId: newRecord.CourseId,
                    CourseName: newRecord.CourseName,
                    LessonId: savedRecord[0].LessonId,
                    LessonNum: savedRecord[0].LessonNum,
                    LessonName: savedRecord[0].LessonName,
                    Elements: savedRecord[0].Elements,
                    IsPublished: savedRecord[0].IsPublished,
                    ProcessId: savedRecord[0].ProcessId,
                    ProcessState: savedRecord[0].ProcessState,
                });

                const newFields = identifyElementFields(records);

                yield put({type: SET_FIELDS, payload: newFields});

                yield put({type: SET_CHANGED_RECORDS, payload: _.cloneDeep(records)});
                const resultArray = handleServerData(records, +mode, dates.st_date ? dates.st_date : defaultStartDate, dates.fin_date ? dates.fin_date : defaultEndDate);
                yield put({type: SET_NEW_DISPLAYED_RECORDS, payload: resultArray});
                const filterValues = yield select(filterUnpublishedSelector);
                yield put(getUnpublishedRecords(filterValues));
            }

        }
    } catch (e) {
        showErrorMessage(e.toString())
    }
}

function* removeRecordFromPublishedSaga(data){
    try {
        const record = data.payload;

        const res = yield call(setDateToPublication, {
            ReadyDate: null,
            lessonId: record.LessonId
        });

        if (res && res.result === 'OK') {
            const dates = yield select(filterSelector);
            const records = _.cloneDeep(yield select(recordsChangedSelector));


            const foundedRecordIndex = records.findIndex(record => record.CourseId === +record.CourseId && record.LessonId === +record.LessonId);

            if (foundedRecordIndex !== -1) {
                const currentDate = moment().locale('ru');
                const defaultStartDate = currentDate.toISOString();
                const defaultEndDate = currentDate.add(1, 'months').toISOString();
                records.splice(foundedRecordIndex, 1);

                yield put({type: SET_CHANGED_RECORDS, payload: _.cloneDeep(records)});
                const resultArray = handleServerData(records, +mode, dates.st_date ? dates.st_date : defaultStartDate, dates.fin_date ? dates.fin_date : defaultEndDate);
                yield put({type: SET_NEW_DISPLAYED_RECORDS, payload: resultArray});
            }
        }


    } catch (e) {
        showErrorMessage(e.toString())
    }
}

function* changeDisplayedRecordsSaga(data) {
    try {
        const mode = yield select(modeSelector);
        const newRecord = data.payload.newRecord;

        const res = yield call(setDateToPublication, {
            ReadyDate: newRecord.DateObject.toISOString(),
            lessonId: newRecord.LessonId
        });

        if (res && res.result === 'OK') {
            const dates = yield select(filterSelector);
            const records = _.cloneDeep(yield select(recordsChangedSelector));


            const foundedRecordIndex = records.findIndex(record => record.CourseId === +newRecord.CourseId && record.LessonId === +newRecord.LessonId);

            if (foundedRecordIndex !== -1) {
                const currentDate = moment().locale('ru');
                const defaultStartDate = currentDate.toISOString();
                const defaultEndDate = currentDate.add(1, 'months').toISOString();
                records[foundedRecordIndex].PubDate = newRecord.DateObject.toISOString();

                yield put({type: SET_CHANGED_RECORDS, payload: _.cloneDeep(records)});
                const resultArray = handleServerData(records, +mode, dates.st_date ? dates.st_date : defaultStartDate, dates.fin_date ? dates.fin_date : defaultEndDate);
                yield put({type: SET_NEW_DISPLAYED_RECORDS, payload: resultArray});
            }
        }
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

        // yield put(getRecords()); //todo maybe need in future
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
        const decryptedParams = new URLSearchParams(location.search);

        let viewModeParam = decryptedParams.has('viewMode') ? +decryptedParams.get('viewMode') : null;
        viewModeParam = viewModeParam ? viewModeParam : +data.payload.mode;
        yield put({type: SET_VIEW_MODE, payload: viewModeParam});
        const dates = yield select(filterSelector);

        const records = _.cloneDeep(yield select(recordsChangedSelector));

        records.forEach((rec) => {
            if (rec.Supervisor) rec.SupervisorId = rec.Supervisor.Id;


            if(rec.Elements && Array.isArray(rec.Elements)) {
                rec.ElementFields = rec.Elements.map(el => el.Name);
            }

        });

        const allCount = records.length;

        const additionalEpisodesCount = records.filter(rec => rec.LessonNum.toString().includes('.')).length;

        const lessonsCount = records.filter(rec => !rec.LessonNum.includes('.')).length;

        yield put({type: SET_ADDITIONAL_INFO, payload: {lessonsCount,additionalEpisodesCount,allCount}});

        let resultArray = handleServerData(records, viewModeParam, dates.st_date ? dates.st_date : data.payload.st_date, dates.fin_date ? dates.fin_date : data.payload.fin_date);

        resultArray.forEach((el, index) => {
            el.id = index + 1;
        });
        yield put({type: SET_DISPLAY_RECORDS, payload: resultArray});
    } catch (e) {
        showErrorMessage(e.toString())
    }
}

const handleServerData = (records, mode, stDate = null, finDate = null) => {
    const currentDate = moment().locale('ru');
    const defaultStartDate = currentDate.toISOString();
    const defaultEndDate = currentDate.add(1, 'months').toISOString();


    let startDate;
    let finishDate;
    if (!stDate && !finDate) {
            startDate = moment(defaultStartDate);
            finishDate = moment(defaultEndDate);
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
            first.DateObject = moment(first.PubDate).locale('ru');
            first.IsEven = isEven;
            first.IsEndOfWeek = moment(first.PubDate).locale('ru').isoWeekday() === 7 && other.length === 0;
            first.IsWeekend = [6,7].includes(moment(first.PubDate).locale('ru').isoWeekday());
            first.WeekendDay = moment(first.PubDate).locale('ru').format('ddd');
            first.CourseLessonName = [first.CourseName, first.LessonName];
            first.PubDate = moment(first.PubDate).locale('ru').format('DD MMM ddd');

            first.Elements.forEach((elem) => {
                const _state = Object.values(ELEMENT_STATE).find(item => item.value === elem.State);
                const elementSupervisorId = (elem.Supervisor && elem.Supervisor.Id) ? elem.Supervisor.Id : null;

                first[elem.Name] = _state ? {css: _state.css, label: _state.label, question: elem.HasAlert, elementId: elem.Id, supervisorId: elementSupervisorId} : {
                    css: "_unknown",
                    label: "Неизвестно",
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

                    if([6,7].includes(moment(currentDate).locale('ru').isoWeekday())){
                        item.WeekendDay = moment(currentDate).locale('ru').format('ddd');
                    }

                    item.IsWeekend = [6,7].includes(moment(currentDate).locale('ru').isoWeekday());
                    item.CourseLessonName = [item.CourseName, item.LessonName];
                    item.DateObject = currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});

                    item.Elements.forEach((elem) => {
                        const _state = Object.values(ELEMENT_STATE).find(st => st.value === elem.State);
                        const elementSupervisorId = (elem.Supervisor && elem.Supervisor.Id) ? elem.Supervisor.Id : null;

                        item[elem.Name] = _state ? {css: _state.css, label: _state.label, question: elem.HasAlert, elementId: elem.Id, supervisorId: elementSupervisorId} : {
                            css: "_unknown",
                            label: "Неизвестно",
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
                PubDate: currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0}).locale('ru').format('DD MMM ddd'),
                DateObject: currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0}).locale('ru'),
                CourseId: null,
                IsEndOfWeek: currentDate.set({hour: 0, minute: 0, second: 0, millisecond: 0}).isoWeekday() === 7,
                IsWeekend: [6,7].includes(moment(currentDate).locale('ru').isoWeekday()),
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

            if(objectData.IsWeekend){
                objectData.WeekendDay = moment(currentDate).locale('ru').format('ddd');
            }

            resultArray.push(objectData);
        }

        if (mode === VIEW_MODE.DAY) {
            isEven = !isEven;
        }
    }

    return resultArray;
};

function* reloadRecordsSaga() {
    yield put({type: REQUEST_START});

    try {
        const params = yield select(paramsSelector);

        const cleanedParams = new URLSearchParams(params);
        cleanedParams.delete('CourseNameUnpublished');
        cleanedParams.delete('LessonNameUnpublished');

        const records = yield call(getRecordsReq, cleanedParams);

        yield put({type: SET_RECORDS, payload: records});
        yield put({type: REQUEST_SUCCESS});
    } catch (e) {
        yield put({type: REQUEST_FAIL});
        yield put(showErrorMessage(e.message));
    }
}


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

        yield put({type: SET_RECORDS, payload: records});
        yield put({type: SET_CHANGED_RECORDS, payload: records});

        const newFields = identifyElementFields(records);

        yield put({type: SET_FIELDS, payload: newFields});
        yield put({type: REQUEST_SUCCESS});

        const startDate = filter.st_date ? filter.st_date : moment().toISOString();

        const finishDate = (filter.fin_date) ? filter.fin_date : moment(startDate).add(1, 'months').toISOString();

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

const identifyElementFields = (records) => {
    const fields = new Set();

    records.forEach(rec => {
        if (rec.Elements && Array.isArray(rec.Elements)) {
            rec.Elements.forEach(el => fields.add(el.Name))
        }
    });

    const sortedFields = [...fields].sort(function (a,b) {
        if(FIELDS_SORT_OBJECT_ORDER[a] !== undefined && FIELDS_SORT_OBJECT_ORDER[b] !== undefined){
            return FIELDS_SORT_OBJECT_ORDER[a] - FIELDS_SORT_OBJECT_ORDER[b];
        }

        if(FIELDS_SORT_OBJECT_ORDER[a] === undefined && FIELDS_SORT_OBJECT_ORDER[b] !== undefined){
            return 1;
        }

        if(FIELDS_SORT_OBJECT_ORDER[a] !== undefined && FIELDS_SORT_OBJECT_ORDER[b] === undefined){
            return -1;
        }

        if(FIELDS_SORT_OBJECT_ORDER[a] === undefined && FIELDS_SORT_OBJECT_ORDER[b] === undefined){
            return 0
        }

    });

    const fieldSet = [];

    sortedFields.forEach((el, inx) => {
        const fieldObj = {id: el};
        fieldObj.header = [{text: el, css: 'up-headers'}];

        fieldObj.css = '_container element-style';
        fieldObj.minWidth = 80;
        fieldObj.template = function (val) {
            const elData = val[el];

            if (elData) {
                return `<div class="element-hover" style="height: 100%;width: -webkit-fill-available; justify-content: center;align-items: center;display: flex;">
                            <div class="state-template-block-dr state-circle ${elData.question ? '' : elData.css} ">
                                <div class="element-status-tooltip-text">${elData.question ? 'Вопрос,' : ''} ${elData.label}</div>
                                <div class="${elData.question ? 'question ' + elData.css : ''}">${elData.question ? '?' : ''}</div>
                            </div>
                        </div>`;
            } else {
                return `<div class="state-template-block-dr state-circle _unknown"></div>`
            }
        };

        fieldSet.push(fieldObj)
    });

    return fieldSet;
};

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

const getRecordByLesson = (lessonId = null) => {
    let urlString = `/api/pm/dashboard${lessonId ? `?${new URLSearchParams({lesson: lessonId})}` : ''}`;
    return commonGetQuery(urlString);
};

const getUnpublishedRecordsReq = (params) => {
    let urlString = `/api/pm/dashboard/lesson-list${params && params.toString().length ? `?${params}` : ''}`;
    return commonGetQuery(urlString);
};

const getUnpublishedLessonsReq = () => {
    return commonGetQuery(`/api/pm/dashboard/lesson-list`);
};

const getCoursesForFilter = () => {
    return commonGetQuery('/api/courses/list');
};
