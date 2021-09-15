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

export const moduleName = 'dashboard-records';
const prefix = `${appName}/${moduleName}`;

const SET_RECORDS = `${prefix}/SET_RECORDS`;
const LOAD_DASHBOARD_RECORDS = `${prefix}/LOAD_DASHBOARD_RECORDS`;
const LOAD_UNPUBLISHED_RECORDS = `${prefix}/LOAD_UNPUBLISHED_RECORDS`;
const CHANGE_RECORD = `${prefix}/CHANGE_RECORD`;

const CHANGE_VIEW_MODE = `${prefix}/CHANGE_VIEW_MODE`;

const CHANGE_FIELD_SET = `${prefix}/CHANGE_FIELD_SET`;
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
    fetching: false,
    viewMode: VIEW_MODE.WEEK,
    showModalOfPublishing: false
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
            console.log('SET_FIELDS', payload);
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


export const getRecords = () => {
    return {type: LOAD_DASHBOARD_RECORDS};
};

export const getUnpublishedRecords = (filterOn = true) => {
    return {type: LOAD_UNPUBLISHED_RECORDS, payload: filterOn};
};

export const setPublishRecordDate = ({isoDateString, lessonId}) => {
    return {type: PUBLISH_RECORD, payload: {isoDateString, lessonId}};
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



export const saga = function* () {
    yield all([
        takeEvery(LOAD_DASHBOARD_RECORDS, getRecordsSaga),
        takeEvery(LOAD_UNPUBLISHED_RECORDS, getUnpublishedRecordsSaga),
        takeEvery(CHANGE_RECORD, updateRecordSaga),
        takeEvery(CHANGE_VIEW_MODE, changeViewModeSaga),
        takeEvery(PUBLISH_RECORD, publishRecordSaga)
    ])
};

function* publishRecordSaga(data) {
    try {
        yield put({type: REQUEST_START});

        yield call(setDateToPublication,
            {
                ReadyDate: data.payload.isoDateString,
                lessonId: data.payload.lessonId
            });

        yield put({type: LOAD_DASHBOARD_RECORDS});
        yield put({type: LOAD_UNPUBLISHED_RECORDS});
        // yield call({type: LOAD_U_RECORDS});

        yield put({type: REQUEST_SUCCESS});
    } catch (e) {
        yield put({type: REQUEST_FAIL});
        showErrorMessage(e)
    }
}

function* getUnpublishedRecordsSaga(data) {
    try {
        yield put({type: REQUEST_START});

        const filter = yield select(filterSelector);

        console.log('filter:', filter)



        const params = $.param({
            course_name: filter.course_name_unpublished,
            lesson_name: filter.lesson_name_unpublished,
            order: filter.order_unpublished
        });
        // params.course_name = filter.course_name_unpublished

        const unpublishedRecords = yield call(getUnpublishedRecordsReq, data.payload ? params : null);




        if(!data.payload){
            yield put({type: SET_ALL_UNPUBLISHED_RECORDS, payload: unpublishedRecords});
        } else {
            yield put({type: SET_UNPUBLISHED_RECORDS, payload: unpublishedRecords});
        }

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

        let resultArray = handleServerData(records, +data.payload.mode, dates.st_date, dates.fin_date);

        yield put({type: SET_DISPLAY_RECORDS, payload: resultArray});
    } catch (e) {
        showErrorMessage(e.toString())
    }
}

const handleServerData = (records, mode, stDate = null, finDate = null) => {
    if (records.length === 0) {
        return [];
    }
    const startDate = moment(stDate ? stDate : records[0].PubDate);
    const finishDate = moment(finDate ? finDate : records[records.length - 1].PubDate);

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
            first.DateObject = moment(first.PubDate);
            first.IsEven = isEven;
            first.PubDate = moment(first.PubDate).locale('ru').format('DD MMM');


            // const processState = Object.values(DASHBOARD_PROCESS_STATE).find(prS => prS.value === first.ProcessState);
            // first.ProcessState = processState ? {css: processState.css, label: processState.label} : {css: "", label: "--"};

            first.Elements.forEach((elem) => {
                const _state = Object.values(DASHBOARD_ELEMENTS_STATE).find(item => item.value === elem.State);

                first[elem.Name] = _state ? {css: _state.css, label: _state.label} : {css: "", label: "--"};
            });

            if (other && other.length > 0) {
                other.forEach(item => {
                    item.Week = '';
                    item.PubDate = '';
                    item.IsEven = isEven;
                    item.DateObject = currentDate.set({hour:0,minute:0,second:0,millisecond:0});

                    item.Elements.forEach((elem) => {
                        const _state = Object.values(DASHBOARD_ELEMENTS_STATE).find(st => st.value === elem.State);
                        item[elem.Name] = _state ? {css: _state.css, label: _state.label} : {
                            css: "_unknown",
                            label: ""
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
                PubDate: currentDate.set({hour:0,minute:0,second:0,millisecond:0}).locale('ru').format('DD MMM'),
                DateObject: currentDate.set({hour:0,minute:0,second:0,millisecond:0}),
                CourseId: null,
                CourseName: "",
                LessonId: null,
                Week: weekHasChanged ? displayWeekRange : '',
                LessonNum: "",
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

    console.log('result array:', resultArray)
    return resultArray;
};

function* getRecordsSaga() {
    yield put({type: REQUEST_START});
    const mode = yield select(modeSelector);

    try {
        const params = yield select(paramsSelector);
        console.log('PARAMS!', params);

        const records = yield call(getRecordsReq, params);

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
            const fieldObj = {id: el,};

            if (inx === 0) {

                fieldObj.header = [
                    {
                        id: 'processElements',
                        text: "Элементы",
                        colspan: fields.size,
                        css: {"text-align": "center"}
                    },
                    {
                        text: el,
                        css: {"text-align": "center"}
                    }
                ];


            } else {
                fieldObj.header = [{text: ''}, {text: el, css: {"text-align": "center"}}];
                fieldObj.width = 150;
                // fieldObj.maxWidth = 160;
            }

            // fieldObj.width = 150;
            fieldObj.css = '_container element-style';
            fieldObj.minWidth = 130;
            // fieldObj.maxWi
            fieldObj.template = function (val) {
                const elData = val[el];


                if (elData) {
                    return `<div style="width: -webkit-fill-available; justify-content: center;align-items: center;display: flex;"><div class="state-template-block-dr ${elData.css}">${elData.label}</div></div>`;
                } else {
                    return `<div class="state-template-block-dr _unknown"></div>`
                }
                // console.log('fieldObj.template works', val.)

            };
            // fieldObj.format = (val) => val ? RECORD_ELEMENT_STATES[val] : '';

            fieldSet.push(fieldObj)
        });

        yield put({type: SET_FIELDS, payload: fieldSet});
        yield put({type: REQUEST_SUCCESS});

        const startDate = params.st_date ? params.st_date : moment().toISOString();

        const finishDate = params.fin_date ? params.fin_date : moment(startDate).add(7, 'days').toISOString();
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
        const newRecord = yield call(updateRecordReq, data.payload); //response.result might be 'OK'

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
    // console.log('params')
    let urlString = `/api/pm/dashboard${params ? `?${params}` : ''}`;
    return commonGetQuery(urlString);
};

const getUnpublishedRecordsReq = (params) => {
    let urlString = `/api/pm/dashboard/lesson-list${params ? `?${params}` : ''}`;
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
