import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {Timeline} from "../types/timeline";
import {push} from "react-router-redux/src";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import {commonGetQuery} from "tools/fetch-tools";


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

export const moduleName = 'timelines';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_TIMELINES = `${prefix}/SET_TIMELINES`;
const LOAD_TIMELINES = `${prefix}/LOAD_TIMELINES`;

const SET_TIMELINE_TO_EDIT = `${prefix}/SET_TIMELINE_TO_EDIT`;
const CLEAR_SELECTED_TIMELINE = `${prefix}/CLEAR_SELECTED_TIMELINE`;



const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;
const TOGGLE_COMPONENT_FORM_VISIBILITY = `${prefix}/TOGGLE_COMPONENT_FORM_VISIBILITY`;
const TOGGLE_EDITOR = `${prefix}/TOGGLE_EDITOR`;

const SELECT_TIMELINE =  `${prefix}/SELECT_TIMELINE`;
const OPEN_EDITOR =  `${prefix}/OPEN_EDITOR`;
const GO_BACK = `${prefix}/GO_BACK`;

const CREATE_NEW_TIMELINE = `${prefix}/CREATE_NEW_TIMELINE`;

// const SELECT_COMPONENT_REQUEST = `${prefix}/SELECT_COMPONENT_REQUEST`;
// const SET_SELECTED_COMPONENT = `${prefix}/SET_SELECTED_COMPONENT`;
// const CLEAN_SELECTED_COMPONENT = `${prefix}/CLEAN_SELECTED_COMPONENT`;
// const CHANGE_COMPONENT = `${prefix}/CHANGE_COMPONENT`; // runs before request
// const UPDATE_COMPONENT = `${prefix}/UPDATE_COMPONENT`; // runs after request complete succesfully


//store

const TimelinesRecord = List<Timeline>([]);
const TimelineRecord: Timeline = {};

export const ReducerRecord = Record({
    timelines: TimelinesRecord,
    fetching: false,
    selectedTimeline: TimelineRecord,
    editorOpened: false
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_TIMELINES:
            console.log(' SET_TIMELINES tinelines', payload);
            return state
                .set('timelines', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        case SET_TIMELINE_TO_EDIT:
            return state
                .set('selectedTimeline', payload);
        case CLEAR_SELECTED_TIMELINE:
            return state.set('selectedTimeline', payload);
        // case UPDATE_COMPONENT:
        //     return state.set('components', payload);
        // case CLEAN_SELECTED_COMPONENT:
        //     return state.set('selectedComponent', null);
        case TOGGLE_EDITOR:
            return state.set('editorOpened', true);
        case TOGGLE_COMPONENT_FORM_VISIBILITY:
            return state.set('componentFormOpened', payload);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];

export const currentTimelineSelector = createSelector(stateSelector, state => state.selectedTimeline);
export const timelinesFetchingSelector = createSelector(stateSelector, state => state.fetching);
export const timelinesSelector = createSelector(stateSelector, state => state.timelines);
export const timelineOpenedSelector = createSelector(stateSelector, state => state.editorOpened);

//actions

export const getTimelines = () => {
    return {type: LOAD_TIMELINES}
};

export const createNewTimeline = (timeline) => {
    return {type: CREATE_NEW_TIMELINE, payload: timeline};
};

export const selectTimeline = (timelineId) => {
    return {type: SELECT_TIMELINE, payload: timelineId}
};

export const openTimelineEditor = (timelineId: number | undefined) => {
    return {type: OPEN_EDITOR, payload: timelineId}
};

export const goBack = () => {
    return {type: GO_BACK}
};


//sagas

export const saga = function* () {
    yield all([
        takeEvery(LOAD_TIMELINES, getTimelinesSaga),
        takeEvery(CREATE_NEW_TIMELINE, createTimelineSaga),
        takeEvery(OPEN_EDITOR, openEditorSaga),
        takeEvery(SELECT_TIMELINE, selectTimelineSaga),
        takeEvery(GO_BACK, goBackSaga),
    ])
};

function* createTimelineSaga(data) {
    try {
        yield put({type: START_REQUEST});
        console.log('createTimelineSaga, payload: ', data.payload);
        // data.CourseId ? delete data.LessonId : delete data.CourseId;
        const mappedTimeline = {
            Name: data.payload.Name,
            // Course: data.payload.Course,
            // Lesson: data.payload.Lesson,
            SpecifCode: data.payload.SpecifCode,
            State: data.payload.State,
            Order: data.payload.OrderNumber,
            Image: data.payload.Image,
            TypeOfUse: data.payload.TypeOfUse
        };

        if(data.payload.CourseId || data.payload.LessonId){
            if(data.payload.CourseId){
                console.log('data.payload.CourseId:' , data.payload.CourseId)
                mappedTimeline.CourseId = data.payload.CourseId
            } else {
                console.log('data.payload.LessonId:' , data.payload.LessonId)
                mappedTimeline.LessonId = data.payload.LessonId
            }
        }

        // data.payload.Course ? mappedTimeline.CourseId
        // {
        //     ...data.payload,
        //     Order: data.payload.OrderNumber,
        //     Image: data.payload.BackgroundImage,
        //
        // };
        yield call(createTimeline, mappedTimeline);

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* selectTimelineSaga(data) {
    try {
        const timelines = yield select(timelinesSelector);
        const timelineToSetInEditor = timelines.find(tmln => tmln.Id === data.payload);

        if(timelineToSetInEditor) {
            yield put({type: SET_TIMELINE_TO_EDIT, payload: timelineToSetInEditor});
        }
    } catch (e) {
        console.log(e);
    }
}

function* openEditorSaga(data){
    try {
        if(data.payload){
            yield put({type: SELECT_TIMELINE, payload: data.payload});
            yield put({type: TOGGLE_EDITOR, payload: true});
        } else {
            yield put({type: TOGGLE_EDITOR, payload: true});
        }
    } catch (e) {
        console.log(e)
    }
}

function* goBackSaga() {
    yield put(push(`/timelines`))
}

function* getTimelinesSaga() {
    yield put({type: START_REQUEST});
    try {
        const params = yield select(paramsSelector);
        const timelines = yield call(_getTimelines, params);

        //todo map timelines

        yield put({type: SET_TIMELINES, payload: timelines});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

const createTimeline = (timeline) => {
    console.log('timeline before request');
    console.log(timeline);
    return fetch("/api/pm/timeline", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(timeline),
    })
        .then(checkStatus)
        .then(parseJSON)
};

const _getTimelines = (params) => {
    let _urlString = `/api/pm/timeline-list${params ? `?${params}` : ''}`;// todo finishi this after backend is done
    return commonGetQuery(_urlString);// todo uncomment this later
    // return fakeTimelines;
};





