import {appName} from '../config'
import {all, call, put, takeEvery} from "@redux-saga/core/effects";
import {GET_SINGLE_COURSE_REQUEST, SOME_ACTION_TO_CHECK} from "../constants/courses";
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {List, Record} from "immutable";
import {createSelector} from "reselect";
// import commonTools from "../../team-task/tools/common"


/**
 * Constants
 * */
export const moduleName = 'course_ver_2';
const prefix = `${appName}/${moduleName}`;

const GET_COURSE_DISCOUNTS_REQUEST = `${prefix}/GET_COURSE_DISCOUNTS_REQUEST`;
const GET_COURSE_DISCOUNTS_START = `${prefix}/GET_COURSE_DISCOUNTS_START`;
const GET_COURSE_DISCOUNTS_SUCCESS = `${prefix}/GET_COURSE_DISCOUNTS_SUCCESS`;
const GET_COURSE_DISCOUNTS_FAIL = `${prefix}/GET_COURSE_DISCOUNTS_FAIL`;

const SET_COURSE_TIMELINES = `${prefix}/SET_COURSE_TIMELINES`;

const GET_CONCRETE_COURSE_REQUEST = `${prefix}/GET_CONCRETE_COURSE_REQUEST`;

const SET_VISIBLE_COURSE = `${prefix}/SET_VISIBLE_COURSE`;


const ReducerRecord = Record({
    loading: false,
    loaded: false,
    discounts: new List(),
    timelines: new List(),
    lastSuccessTime: null,
    notFound: false,
    visibleCourseId: null,
});

const Discount = Record({
    value: null,
    descr: null,
});

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case GET_COURSE_DISCOUNTS_START:
            return state.set("loading", true);

        case GET_COURSE_DISCOUNTS_SUCCESS:
            return state
                .set("loading", false)
                .set("discounts", arrayToList(payload, Discount));

        case GET_COURSE_DISCOUNTS_FAIL:
            return state.set("loading", false);

        case SET_COURSE_TIMELINES:
            console.log('set_course_timelines');
            return state.set('timelines', [...payload]);

        case SET_VISIBLE_COURSE:
            return state.set("visibleCourseId", payload);

        default:
            return state
    }
}

const arrayToList = (values, DataRecord) => {
    return values.reduce(
        (acc, value) => acc.push(new DataRecord(value)),
        new List([])
    )
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading);
export const discountSelector = createSelector(stateSelector, state => state.discounts);
export const timelinesCourseSelector = createSelector(stateSelector, state => state.timelines);
export const visibleCourseSelector = createSelector(stateSelector, state => state.visibleCourseId);

/**
 * Action Creators
 * */
export const getCourseDiscounts = () => {
    return {type: GET_COURSE_DISCOUNTS_REQUEST}
};

export const setVisibleCourse = (courseId) => {
    return {type: SET_VISIBLE_COURSE, payload: courseId}
};

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_COURSE_DISCOUNTS_REQUEST, getCourseDiscountsSaga),
        takeEvery(GET_CONCRETE_COURSE_REQUEST, getCourseSaga),
        takeEvery(GET_SINGLE_COURSE_REQUEST, getSingleCourseSaga),
        takeEvery(SOME_ACTION_TO_CHECK, someSaga),
        // takeEvery(GET_SINGLE_COURSE_SUCCESS, setTimelinesSaga)
    ])
};

function* someSaga(data) {
    try {
        yield ;
        console.log('someSaga', data);
    }catch (e) {
        console.log(e)
    }
}

function* setTimelinesSaga(data) {
    try {
        console.log('setTimelinesSaga, ', data)
        // const mappedTimelines = data.payload.Timelines.map(tm => ({
        //         ...tm,
        //         CourseId: tm.Course ? tm.Course.Id : null,
        //         LessonId: tm.Lesson ? tm.Lesson.Id : null,
        //         Events: tm.Events.map(ev => ({
        //             ...ev,
        //             year: ev.Year ? ev.Year : new Date(ev.Date).getFullYear(),
        //             month: ev.Month ? ev.Month : new Date(ev.Date).getMonth() + 1,
        //             name: ev.Name,
        //             color: commonTools.getColor(),
        //             date: ev.Date ? new Date(ev.Date).toLocaleDateString("ru-Ru") : `${ev.Month ? ev.Month + '.' : ''}${ev.Year}`,
        //             visible: true,
        //             DisplayDate: ev.Date ?  //это дата для отображения целиком строкой
        //     new Date(ev.Date).toLocaleDateString("ru-Ru") :
        //     `${ev.DayNumber ? ev.DayNumber.toString().padStart(2, '0') + '.' : ''}${ev.Month ? ev.Month.toString().padStart(2, '0') + '.' : ''}${ev.Year}`,
        //             DayNumber: ev.Date ? new Date(ev.Date).getDate() : ev.DayNumber ? ev.DayNumber : null, //а это дата для  отображения только дня
        //             Month: ev.Month ? ev.Month : ev.Date ? new Date(ev.Date).getMonth() + 1 : null,
        //             Year: ev.Year ? ev.Year : ev.Date ? new Date(ev.Date).getFullYear() : null
        //         })),
        //     Periods: tm.Periods.map(pr => ({
        //         ...pr,
        //         StartYear: pr.StartYear ? pr.StartYear :
        //             pr.LbYear ? pr.LbYear :
        //                 new Date(pr.LbDate).getFullYear(),
        //
        // StartMonth: pr.StartMonth ? pr.StartMonth :
        //     pr.LbMonth ? pr.LbMonth :
        //         new Date(pr.LbDate).getMonth() + 1,
        // StartDay: pr.StartDay ? pr.StartDay : new Date(pr.LbDate).getDate(),
        //
        // EndYear: pr.EndYear ? pr.EndYear :
        //     pr.RbYear ? pr.RbYear :
        //         new Date(pr.RbDate).getFullYear(),
        //
        // EndMonth: pr.EndMonth ? pr.EndMonth :
        //     pr.RbMonth ? pr.RbMonth :
        //         new Date(pr.RbDate).getMonth() + 1,
        // EndDay: pr.EndDay ? pr.EndDay : new Date(pr.RbDate).getDate(),
        //
        //
        // startDate: pr.StartDate ?
        //     new Date(pr.StartDate).toLocaleDateString("ru-Ru") :
        //     pr.LbDate ? new Date(pr.LbDate).toLocaleDateString("ru-Ru") :
        //         `${pr.LbMonth ? pr.LbMonth + '.' : ''}${pr.LbYear}`,
        // endDate: pr.EndDate ? new Date(pr.EndDate).toLocaleDateString("ru-Ru") :
        //     pr.RbDate ? new Date(pr.RbDate).toLocaleDateString("ru-Ru") :
        //         `${pr.RbMonth ? pr.RbMonth + '.' : ''}${pr.RbYear}`,
        // // _period.name = item.Name;
        // color: commonTools.getColor(),
        //
        // DisplayStartDate:
        //     pr.LbDate ? new Date(pr.LbDate).toLocaleDateString("ru-Ru") :
        //         pr.StartDate ? new Date(pr.StartDate).toLocaleDateString("ru-Ru") :
        //             `${pr.StartDay ? pr.StartDay.toString().padStart(2, '0') + '.' : ''}${pr.StartMonth ? pr.StartMonth.toString().padStart(2, '0') + '.' : ''}${pr.StartYear}`,
        //
        // DisplayEndDate: pr.RbDate ? new Date(pr.RbDate).toLocaleDateString("ru-Ru") :
        //     pr.EndDate ? new Date(pr.EndDate).toLocaleDateString("ru-Ru") :
        //         `${pr.EndDay ? pr.EndDay.toString().padStart(2, '0') + '.' : ''}${pr.EndMonth ? pr.EndMonth.toString().padStart(2, '0') + '.' : ''}${pr.EndYear}`,
        //     }))
        //     })
        // );

        yield put({type: SET_COURSE_TIMELINES, payload: data.payload});
    } catch (e) {
        console.log(e)
    }
}

function* getSingleCourseSaga(data) {
    try {
        yield put({type: SET_COURSE_TIMELINES, payload: []});
    } catch (e) {
        yield put({type: GET_COURSE_DISCOUNTS_FAIL});
        console.log(e.toString())
    }
}

function* getCourseDiscountsSaga() {
    try {
        yield put({type: GET_COURSE_DISCOUNTS_START});

        let _discounts = yield call(_fetchDiscounts);
        yield put({type: GET_COURSE_DISCOUNTS_SUCCESS, payload: _discounts})
    } catch (e) {
        yield put({type: GET_COURSE_DISCOUNTS_FAIL, payload: {e}})
    }
}

function _fetchDiscounts() {
    return fetch("/api/courses/discounts", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* getCourseSaga(data) {
    //
    //
    // console.log(data)
    //
    // yield put({type: GET_SINGLE_COURSE_REQUEST})
    //
    // try {
    //     const _course = yield call(_fetchCourse, data.payload),
    //         _state = yield select(state => state)
    //
    //     // handleCourse(_course, _state);
    //
    //     yield put({type: GET_SINGLE_COURSE_SUCCESS, payload: _course})
    // } catch (err) {
    //
    //     console.error(err)
    //
    //     if (err.status === 404) {
    //         yield put({type: SET_COURSE_NOT_FOUND})
    //     } else {
    //         yield put({type: GET_SINGLE_COURSE_FAIL, payload: err})
    //     }
    // }
}

function _fetchCourse(url, options) {
    const _fetchUrl = "/api/courses/" + url + (options && options.absPath ? "?abs_path=true" : "")

    return fetch(_fetchUrl, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
        .then((data) => {
            console.log(data)

            return data
        })
}
