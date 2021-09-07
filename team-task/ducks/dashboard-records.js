import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {commonGetQuery} from "tools/fetch-tools";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import _ from "lodash";
import moment from "moment";
import {RECORD_ELEMENT_STATES} from "../constants/dashboard-records";

export const moduleName = 'dashboard-records';
const prefix = `${appName}/${moduleName}`;

const SET_RECORDS = `${prefix}/SET_RECORDS`;
const LOAD_DASHBOARD_RECORDS = `${prefix}/LOAD_DASHBOARD_RECORDS`;
const CHANGE_RECORD = `${prefix}/CHANGE_RECORD`;

const CHANGE_VIEW_MODE = `${prefix}/CHANGE_VIEW_MODE`;

const CHANGE_FIELD_SET = `${prefix}/CHANGE_FIELD_SET`;
const SET_FIELDS = `${prefix}/SET_FIELDS`;
const SET_DISPLAY_RECORDS = `${prefix}/SET_DISPLAY_RECORDS`;
const SET_VIEW_MODE = `${prefix}/SET_VIEW_MODE`;

const REQUEST_START = `${prefix}/REQUEST_START`;
const REQUEST_SUCCESS = `${prefix}/REQUEST_SUCCESS`;
const REQUEST_FAIL = `${prefix}/REQUEST_FAIL`;


const RECORDS_EXAMPLE_SET = [
    {
        Week: '5/9 - 12/9',
        Date: '5 ceн',
        CourseName: 'Курс какой-то курс кря краиииуиуки уиукиукивищль',
        LessonNum: 4,
        LessonName: 'Some lesson name',
        Elements: [
            {
                Id: 1,
                ColumnName: 'Literature',
                Name: 'Литература',
                State: 'Опубликован'
            },
            {
                Id: 2,
                ColumnName: 'Sound',
                Name: 'Звук',
                State: 'Опубликован'
            },
            {
                Id: 3,
                ColumnName: 'Text',
                Name: 'Текст',
                State: 'Опубликован'
            }
        ],
        IsPublished: '18 марта 2021',
        ProcessState: 'Активный',
        ElementsTitle: 'asdf'
    },
];

const defaultFieldSet = new Set([
    // {
    //     id: 'Sound', header: 'Звук'
    // },
    // {
    //     id: 'Transcript', header: 'Транскрипт'
    // },
    // {
    //     id: 'Illustration', header: 'Иллюстрация'
    // },
    // {
    //     id: 'Literature', header: 'Литература'
    // },
    // {
    //     id: 'Music', header: 'Музыка'
    // },
    // {
    //     id: 'Text', header: 'Текст'
    // },
]);

export const VIEW_MODE = {
    WEEK: 0,
    DAY: 1,
    COMPACT: 2,
}

const defaultFieldSetObject = {
    Week: {},

};

export const ReducerRecord = Record({
    records: RECORDS_EXAMPLE_SET,
    fieldSet: defaultFieldSet,
    displayRecords: defaultFieldSet,
    fetching: false,
    viewMode: VIEW_MODE.WEEK
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

        // case
        default:
            return state
    }
}

const stateSelector = state => state[moduleName];

export const recordsSelector = createSelector(stateSelector, state => state.records);
export const displayRecordsSelector = createSelector(stateSelector, state => state.displayRecords);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);
export const elementsFieldSetSelector = createSelector(stateSelector, state => state.fieldSet);
export const modeSelector = createSelector(stateSelector, state => state.viewMode);


export const getRecords = () => {
    return {type: LOAD_DASHBOARD_RECORDS};
};

export const changeRecord = (record) => {
    return {type: CHANGE_RECORD, payload: record};
};

export const changeViewMode = (mode) => {
    console.log('changeViewMode');
    console.log('mode', mode);
    return {type: CHANGE_VIEW_MODE, payload: mode}
};

export const saga = function* () {
    yield all([
        takeEvery(LOAD_DASHBOARD_RECORDS, getRecordsSaga),
        takeEvery(CHANGE_RECORD, updateRecordSaga),
        takeEvery(CHANGE_VIEW_MODE, changeViewModeSaga)
    ])
};

function* changeViewModeSaga(data) {
    try {
        yield put({type: SET_VIEW_MODE, payload: +data.payload});
        const records = _.cloneDeep(yield select(recordsSelector));

        let resultArray = handleServerData(records, +data.payload);

        yield put({type: SET_DISPLAY_RECORDS, payload: resultArray});
    } catch (e) {
        showErrorMessage(e.toString())
    }
}

const handleServerData = (records, mode) => {
    const startDate = moment(records[0].PubDate);
    const finishDate = moment(records[records.length - 1].PubDate);

    const daysBetween = finishDate.diff(startDate, "days");

    const resultArray = [];
    let week = 0,
        displayWeekRange = '',
        isEven = true;

    for (let i = 0; i <= daysBetween; i++) {
        let currentDate = moment(startDate).add(i, 'days'),
            currentWeek = currentDate.isoWeek();

        const weekHasChanged = currentWeek !== week
        if((mode === VIEW_MODE.WEEK) && week && weekHasChanged){
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
            first.IsEven = isEven;
            first.PubDate = moment(first.PubDate).format('DD MMM');
            first.Elements.forEach((elem) => {
                first[elem.Name] = elem.State ? elem.State : '';
            });

            if (other && other.length > 0) {
                other.forEach(item => {
                    item.Week = '';
                    item.PubDate = '';
                    item.IsEven = isEven;
                    item.Elements.forEach((elem) => {
                        item[elem.Name] = elem.State ? elem.State : '';
                    })
                });
            }

            resultArray.push(first, ...other);
        } else {
            const objectData = {
                IsEven: isEven,
                PubDate: currentDate.format('DD MMM'),
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

        if (mode === VIEW_MODE.DAY){
            isEven = !isEven;
        }
    }

    return resultArray;
};

function* getRecordsSaga() {
    yield put({type: REQUEST_START});
    const mode = yield select(modeSelector);

    try {
        const params = yield select(paramsSelector);

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
            const fieldObj = { id: el, };

            if (inx === 0) {
                fieldObj.header = [
                    {
                        text: "Элементы",
                        colspan: fields.size,
                        css: {"text-align": "center"}
                    },
                    el
                ];

                fieldObj.fillspace = true;
            } else {
                fieldObj.header = ["", el]
            }

            fieldObj.format = (val) => val ? RECORD_ELEMENT_STATES[val] : '';

            fieldSet.push(fieldObj)
        });

        yield put({ type: SET_FIELDS, payload: fieldSet });
        yield put({type: REQUEST_SUCCESS});

        yield put({type: CHANGE_VIEW_MODE, payload: mode});

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

const getRecordsReq = (params) => {
    let urlString = `/api/pm/dashboard?${params}`;
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
