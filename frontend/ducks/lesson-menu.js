import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, Map} from 'immutable'
import {all, call, put, takeEvery,} from "@redux-saga/core/effects";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {parseReadyDate} from "tools/time-tools";

/**
 * Constants
 * */
export const moduleName = 'lesson-menu'
const prefix = `${appName}/${moduleName}`

const GET_LESSONS_ALL_REQUEST = `${prefix}/GET_LESSONS_ALL_REQUEST`
const GET_LESSONS_ALL_START = `${prefix}/GET_LESSONS_ALL_START`
const GET_LESSONS_ALL_SUCCESS = `${prefix}/GET_LESSONS_ALL_SUCCESS`
const GET_LESSONS_ALL_FAIL = `${prefix}/GET_LESSONS_ALL_FAIL`


const CourseRecord = Record({
    Id: null,
    Name: null,
    URL: null,
    OneLesson: false,
    IsSubsRequired: false,
    IsBought: false,
    IsPaid: false,
    PaidTp: null,
    PaidDate: null,
    IsGift: false,
    IsPending: false,
    IsSubsFree: true,
    ProductId: null,
    ProductName: null,
    Price: 0,
    DPrice: 0,
    Tests: []
})

const ReducerRecord = Record({
    loading: false,
    loaded: false,
    lessons: [],
    course: new CourseRecord(),
    authors: new Map([]),
    // lastSuccessTime: null,
})

const AuthorRecord = Record({
    "Id": null,
    "FirstName": null,
    "LastName": null,
    "Portrait": null,
    "PortraitMeta": null,
    "URL": null,
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_LESSONS_ALL_START:
            return state
                .set('loaded', false)
                .set('loading', true)

        case GET_LESSONS_ALL_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('lessons', payload.Lessons)
                .set('course', new CourseRecord(payload.Course))
                .set('authors', dataToEntries(payload.Authors, AuthorRecord))
                // .set('lastSuccessTime', payload.lastSuccessTime)

        case GET_LESSONS_ALL_FAIL:
            return state
                .set('loading', false)

        default:
            return state

    }
}

const dataToEntries = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.set(value.Id, new DataRecord(value)),
        new Map({})
    )
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)
// const successTimeSelector = createSelector(stateSelector, state => state.lastSuccessTime)
export const lessonsSelector = createSelector(stateSelector, (state) => {

    console.log(state.lessons)

    return state.lessons
})
export const courseSelector = createSelector(stateSelector, state => state.course)
export const authorsSelector = createSelector(stateSelector, (state) => {
    let _array = state.authors.toArray();

    return _array.map((item,) => {
        return item.toObject()
    })
})


/**
 * Action Creators
 * */
export const getLessonsAll = (courseUrl, lessonUrl) => {
    return {type: GET_LESSONS_ALL_REQUEST, payload: {courseUrl: courseUrl, lessonUrl: lessonUrl}}
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_LESSONS_ALL_REQUEST, getLessonsAllSaga),
    ])
}


function* getLessonsAllSaga({payload}) {
    yield put({type: GET_LESSONS_ALL_START})

    try {
        const _data = yield call(_fetchLessons, payload)

        yield put({type: GET_LESSONS_ALL_SUCCESS, payload: _data})
    } catch (e) {

        console.error(e)

        yield put({ type: GET_LESSONS_ALL_FAIL, payload: {e} })
    }
}

function _fetchLessons({courseUrl, lessonUrl}) {
    let _url = `/api/lessons-all/${courseUrl}` + (lessonUrl ? `/${lessonUrl}` : "")

    return fetch(_url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            // data.lastSuccessTime = Date.now()

            return _handleLessons(data)
        })
}

const _handleLessons = (data) => {
    try {
        data.Lessons.forEach((lesson) => {
            let _readyDate = lesson.ReadyDate ? new Date(lesson.ReadyDate) : null,
                _parsedDate = parseReadyDate(_readyDate);

            lesson.readyMonth = _parsedDate.readyMonth;
            lesson.readyYear = _parsedDate.readyYear;

            if (lesson.CoverMeta) {
                lesson.CoverMeta = JSON.parse(lesson.CoverMeta)
            }

            let _parentNumber = lesson.Number;
            lesson.Lessons.forEach((subLesson) => {
                subLesson.Number = _parentNumber + '.' + subLesson.Number
            })
        });

        return data
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};