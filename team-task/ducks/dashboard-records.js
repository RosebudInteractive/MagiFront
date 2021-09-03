import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {commonGetQuery} from "tools/fetch-tools";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";

export const moduleName = 'dashboard-records';
const prefix = `${appName}/${moduleName}`;

const SET_RECORDS = `${prefix}/SET_RECORDS`;
const LOAD_DASHBOARD_RECORDS = `${prefix}/LOAD_DASHBOARD_RECORDS`;
const CHANGE_RECORD = `${prefix}/CHANGE_RECORD`;

const CHANGE_FIELD_SET = `${prefix}/CHANGE_FIELD_SET`;
const SET_FIELDS = `${prefix}/SET_FIELDS`;

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


const defaultFieldSetObject = {
    Week: {},

};

export const ReducerRecord = Record({
    records: RECORDS_EXAMPLE_SET,
    fieldSet: defaultFieldSet,
    fetching: false,
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
        case SET_FIELDS:
            console.log('SET_FIELDS', payload);
            return state.set('fieldSet', payload);
        default:
            return state
    }
}

const stateSelector = state => state[moduleName];

export const recordsSelector = createSelector(stateSelector, state => state.records);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);
export const elementsFieldSetSelector = createSelector(stateSelector, state => state.fieldSet);


export const getRecords = () => {
    return {type: LOAD_DASHBOARD_RECORDS};
};

export const changeRecord = (record) => {
    return {type: CHANGE_RECORD, payload: record};
};

export const saga = function* () {
    yield all([
        takeEvery(LOAD_DASHBOARD_RECORDS, getRecordsSaga),
        takeEvery(CHANGE_RECORD, updateRecordSaga),
    ])
};


function* getRecordsSaga() {
    yield put({type: REQUEST_START});

    try {
        const params = yield select(paramsSelector);

        // const records = yield call(getRecordsReq, params); //todo uncomment after req complete

        // yield put({
        //     type: SET_RECORDS,
        //     payload: records
        // });

        const records = yield select(recordsSelector);

        const fieldSet = new Set(records[0].Elements.map((el, inx) => {
            const fieldObj = {
                id: el.ColumnName,
                // header: el.Name,
            };

            if (inx === 0) {
                fieldObj.header = [
                    {
                        text: "Элементы",
                        colspan: records[0].Elements.length,
                        css: {"text-align": "center"}
                    },
                    el.Name
                ];

                fieldObj.fillspace = true;
            } else {
                fieldObj.header = ["", el.Name]
            }

            return fieldObj;
        }));


        yield put({
            type: SET_FIELDS,
            payload: fieldSet
        });
        yield put({type: REQUEST_SUCCESS});


// yield put({
//     type: CHANGE_FIELD_SET,
//     payload: new Set(records[0].Elements.map(el => el.Name))
// });
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
    let urlString = `/some/url?${params}`; //todo change url later
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
