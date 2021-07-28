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
import {createEvents, setEvents} from "tt-ducks/events-timeline";
import {createPeriods, setPeriods} from "tt-ducks/periods-timeline";

//constants

export const moduleName = 'timelines';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_TIMELINES = `${prefix}/SET_TIMELINES`;
const LOAD_TIMELINES = `${prefix}/LOAD_TIMELINES`;
const GET_TIMELINE = `${prefix}/GET_TIMELINE`;

const SET_TIMELINE_TO_EDIT = `${prefix}/SET_TIMELINE_TO_EDIT`;
const CLEAR_SELECTED_TIMELINE = `${prefix}/CLEAR_SELECTED_TIMELINE`;


const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;
const TOGGLE_COMPONENT_FORM_VISIBILITY = `${prefix}/TOGGLE_COMPONENT_FORM_VISIBILITY`;
const TOGGLE_EDITOR = `${prefix}/TOGGLE_EDITOR`;

const SELECT_TIMELINE = `${prefix}/SELECT_TIMELINE`;
// const UNSELECT_TIMELINE =  `${prefix}/UNSELECT_TIMELINE`;
const OPEN_EDITOR = `${prefix}/OPEN_EDITOR`;
const GO_BACK = `${prefix}/GO_BACK`;

const CREATE_NEW_TIMELINE = `${prefix}/CREATE_NEW_TIMELINE`;
const UPDATE_TIMELINE = `${prefix}/UPDATE_TIMELINE`;
const LINK_EVENT = `${prefix}/LINK_EVENT`;
const LINK_PERIOD = `${prefix}/LINK_PERIOD`;

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
            return state.set('selectedTimeline', {});
        case TOGGLE_EDITOR:
            return state.set('editorOpened', payload);
        case TOGGLE_COMPONENT_FORM_VISIBILITY:
            return state.set('componentFormOpened', payload);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];

export const currentTimelineSelector = createSelector(stateSelector, state => {
    return state.selectedTimeline
});
export const timelinesFetchingSelector = createSelector(stateSelector, state => state.fetching);
export const timelinesSelector = createSelector(stateSelector, state => state.timelines);
export const timelineOpenedSelector = createSelector(stateSelector, state => state.editorOpened);

//actions

export const getTimelines = () => {
    return {type: LOAD_TIMELINES}
};

export const getOneTimeline = ({id, setToEditor = true}) => {
    return {type: GET_TIMELINE, payload: {id, setToEditor}}
};
export const clearSelectedTimeline = () => {
    return {type: CLEAR_SELECTED_TIMELINE}
};

export const linkEvent = ({eventId, timelineId}) => {
    return {type: LINK_EVENT, payload: {eventId, timelineId}}
};

export const linkPeriod = ({periodId, timelineId}) => {
    return {type: LINK_PERIOD, payload: {periodId, timelineId}}
};

export const createNewTimeline = (timeline, setToSelected = false, events = [], periods = []) => {
    return {type: CREATE_NEW_TIMELINE, payload: {timeline, setToSelected, events, periods}};
};

export const updateTimeline = (timelineId, timelineData) => {
    return {type: UPDATE_TIMELINE, payload: {timelineId, timelineData}};
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
        takeEvery(GET_TIMELINE, getTimelineSaga),
        takeEvery(UPDATE_TIMELINE, updateTimelineSaga),
        takeEvery(LINK_EVENT, linkEventSaga),
        takeEvery(LINK_PERIOD, linkPeriodSaga),
    ])
};

function* linkEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(addEventToTimeline, {
            eventId: data.payload.eventId,
            timelineId: data.payload.timelineId
        });

        yield put({type: GET_TIMELINE, payload: {id: data.payload.timelineId, setToEditor: true}});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.log(e);
        showErrorMessage(e)
    }
}

function* linkPeriodSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(addPeriodToTimeline, {
            periodId: data.payload.periodId,
            timelineId: data.payload.timelineId
        });

        yield put({type: GET_TIMELINE, payload: {id: data.payload.timelineId, setToEditor: true}});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.log(e);
        showErrorMessage(e)
    }
}

function* updateTimelineSaga(data) {
    try {
        yield put({type: START_REQUEST});
        const mappedTimeline = {
            Name: data.payload.timelineData.Name,
            SpecifCode: data.payload.timelineData.SpecifCode,
            TypeOfUse: parseInt(data.payload.timelineData.TypeOfUse),
            State: parseInt(data.payload.timelineData.State)
        };

        if (data.payload.timelineData.Image) {
            mappedTimeline.Image = data.payload.timelineData.Image.file;
            mappedTimeline.ImageMeta = data.payload.timelineData.Image.meta;
        }

        if(data.payload.timelineData.OrderNumber || data.payload.timelineData.Order) {
            if(data.payload.timelineData.OrderNumber){
                mappedTimeline.Order = parseInt(data.payload.timelineData.OrderNumber);
            }

            if(data.payload.timelineData.Order){
                mappedTimeline.Order = parseInt(data.payload.timelineData.Order);
            }

        }

        if (data.payload.timelineData.CourseId || data.payload.timelineData.LessonId) {
            if (data.payload.timelineData.CourseId) {
                mappedTimeline.CourseId = data.payload.timelineData.CourseId;
                mappedTimeline.LessonId = null;
            } else {
                mappedTimeline.LessonId = data.payload.timelineData.LessonId;
                mappedTimeline.CourseId = null;
            }
        }

        yield call(changeTimeline, data.payload.timelineId, mappedTimeline);

        yield put({type: SUCCESS_REQUEST});
        yield put(getTimelines());
    } catch (e) {
        yield put({type: FAIL_REQUEST})
        console.log(e);
        showErrorMessage(e);
    }
}

function* createTimelineSaga(data) {
    try {
        yield put({type: START_REQUEST});
        const mappedTimeline = {
            Name: data.payload.timeline.Name,
            SpecifCode: data.payload.timeline.SpecifCode,
            State: data.payload.timeline.State,
            Order: parseInt(data.payload.timeline.OrderNumber || data.payload.timeline.Order),
            Image: data.payload.timeline.Image ? data.payload.timeline.Image.file : null,
            ImageMeta: data.payload.timeline.Image ? JSON.stringify(data.payload.timeline.Image.meta) : null,
            TypeOfUse: data.payload.timeline.TypeOfUse
        };

        if (data.payload.timeline.CourseId || data.payload.timeline.LessonId) {
            if (data.payload.timeline.CourseId) {
                mappedTimeline.CourseId = data.payload.timeline.CourseId
            } else {
                mappedTimeline.LessonId = data.payload.timeline.LessonId
            }
        }

        const res = yield call(createTimeline, mappedTimeline);


        if (res && res.id) {
            if (data.payload.events && data.payload.events.length > 0) {
                yield put(createEvents({events: data.payload.events, timelineId: res.id}));
            }

            if (data.payload.periods && data.payload.periods.length > 0) {
                yield put(createPeriods({periods: data.payload.periods, timelineId: res.id}));
            }

            if (data.payload.setToSelected) {
                yield put({type: GET_TIMELINE, payload: {id: res.id, setToEditor: true}});
            }

        }

        yield put({type: SUCCESS_REQUEST});
        yield put(getTimelines());
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

        if (timelineToSetInEditor) {
            yield put({type: SET_TIMELINE_TO_EDIT, payload: timelineToSetInEditor});
        } else {
            yield put({
                type: SET_TIMELINE_TO_EDIT, payload: {
                    Name: '',
                    ShortName: '',
                    TypeOfUse: 1,
                    Code: 123,
                    NameOfLectionOrCourse: '',
                    State: 1,
                    OrderNumber: 0,
                    Course: null,
                    Lesson: null,
                    CourseId: null,
                    LessonId: null,
                    HasScript: false,
                    TimeCr: new Date()
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
}

function* openEditorSaga(data) {
    try {
        if (data.payload) {
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

        const mappedTimelines = timelines.map(tm => {
            const nameOfLectionOrCourse = tm.Lesson ? tm.Lesson.Name :
                tm.Course ? tm.Course.Name : '';
            return {
                ...tm,
                NameOfLectionOrCourse: nameOfLectionOrCourse,
                OrderNumber: tm.Order,
                Code: tm.SpecifCode
            }
        });

        yield put({type: SET_TIMELINES, payload: mappedTimelines});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

function* getTimelineSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const timeline = yield call(getTimeline, data.payload.id);

        if (timeline) {
            yield put({type: SUCCESS_REQUEST});
        }
        const timelineData = {
            ...timeline,
            CourseId: timeline.Course ? timeline.Course.Id : null,
            LessonId: timeline.Lesson ? timeline.Lesson.Id : null,
        };

        yield put(setEvents(timelineData.Events));
        yield put(setPeriods(timelineData.Periods));

        if (data.payload.setToEditor) {
            yield put({type: SET_TIMELINE_TO_EDIT, payload: timelineData});
        }
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.log(e.toString());
        yield put(showErrorMessage(e.toString()))
    }
}

const getTimeline = (timelineId) => {
    return commonGetQuery(`/api/pm/timeline/${timelineId}`);
};

const createTimeline = (timeline) => {
    return fetch("/api/pm/timeline", {
        method: 'POST',
        headers: {"Content-type": "application/json"},
        credentials: 'include',
        body: JSON.stringify(timeline),
    })
        .then(checkStatus)
        .then(parseJSON)
};

// /api/pm/event

const changeTimeline = (timelineId, timeline) => {
    return fetch(`/api/pm/timeline/${timelineId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(timeline),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const addEventToTimeline = ({eventId, timelineId}) => {
    return fetch(`/api/pm/timeline/add-item/${timelineId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({eventId: eventId}),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const addPeriodToTimeline = ({periodId, timelineId}) => {
    return fetch(`/api/pm/timeline/add-item/${timelineId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({periodId: periodId}),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const _getTimelines = (params) => {
    let _urlString = `/api/pm/timeline-list${params ? `?${params}` : ''}`;
    return commonGetQuery(_urlString);
};





