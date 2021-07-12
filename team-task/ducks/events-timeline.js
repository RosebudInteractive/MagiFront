import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {push} from "react-router-redux/src";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import {commonGetQuery} from "tools/fetch-tools";
import {Event} from "../types/events";
import moment from "moment";


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

export const moduleName = 'events-timeline';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_EVENTS = `${prefix}/SET_EVENTS`;
const LOAD_EVENTS = `${prefix}/LOAD_EVENTS`;

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;

const TOGGLE_EDITOR = `${prefix}/TOGGLE_EDITOR`;

const SELECT_EVENT = `${prefix}/SELECT_EVENT`;
const UNSELECT_EVENT = `${prefix}/UNSELECT_EVENT`;
const OPEN_EDITOR = `${prefix}/OPEN_EDITOR`;
const GO_BACK = `${prefix}/GO_BACK`;

const CREATE_NEW_EVENT = `${prefix}/CREATE_NEW_EVENT`;
const UPDATE_EVENT = `${prefix}/UPDATE_EVENT`;
const REMOVE_EVENT = `${prefix}/REMOVE_EVENT`;
const GET_EVENT = `${prefix}/GET_EVENT`;
const FIND_EVENT = `${prefix}/FIND_EVENT`;
const SET_FINDED = `${prefix}/SET_FINDED`;

// const SELECT_COMPONENT_REQUEST = `${prefix}/SELECT_COMPONENT_REQUEST`;
// const SET_SELECTED_COMPONENT = `${prefix}/SET_SELECTED_COMPONENT`;
// const CLEAN_SELECTED_COMPONENT = `${prefix}/CLEAN_SELECTED_COMPONENT`;
// const CHANGE_COMPONENT = `${prefix}/CHANGE_COMPONENT`; // runs before request
// const UPDATE_COMPONENT = `${prefix}/UPDATE_COMPONENT`; // runs after request complete succesfully


//store


const EventsRecord = List<Event>([]);
const EventRecord: Event = {};

export const ReducerRecord = Record({
    events: EventsRecord,
    fetching: false,
    selectedEvent: EventRecord,
    editorOpened: false,
    finded: null
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_EVENTS:
            return state
                .set('events', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        case SELECT_EVENT:
            console.log('selected event:', payload);
            return state
                .set('selectedEvent', payload);
        case UNSELECT_EVENT:
            return state.set('selectedEvent', payload);
        case TOGGLE_EDITOR:
            console.log('TOGGLE_EDITOR', payload);
            return state.set('editorOpened', payload);
        case SET_FINDED:
            console.log('SET_FINDED,', payload)
            return state.set('finded', payload);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];

export const currentEventSelector = createSelector(stateSelector, state => state.selectedEvent);
export const eventsFetchingSelector = createSelector(stateSelector, state => state.fetching);
export const eventsSelector = createSelector(stateSelector, state => state.events);
export const eventEditorOpenedSelector = createSelector(stateSelector, state => state.editorOpened);
export const findedEventsSelector = createSelector(stateSelector, state => state.finded);

//actions

export const requestEvents = () => {
    return {type: LOAD_EVENTS}
};

export const createNewEvent = (event) => {
    return {type: CREATE_NEW_EVENT, payload: event};
};

// export const selectEvent = (timelineId) => {
//     return {type: SELECT_EVENT, payload: timelineId}
// };

export const findEvent = (data) => {
    return {type: FIND_EVENT, payload: data}
}

export const openEventEditor = ({eventId = null, timelineId = null}) => {
    console.log('openEventEditor, {eventId, timelineId}', {eventId, timelineId});
    return {type: OPEN_EDITOR, payload: {eventId, timelineId}}
};

export const toggleEditorTo = (isOn) => {
    return {type: TOGGLE_EDITOR, payload: isOn}
};

export const goBack = () => {
    return {type: GO_BACK}
};

export const updateEventData = ({eventId, eventData}) => {
    return {type: UPDATE_EVENT, payload: {...eventData, Id: eventId}}
}

export const removeEvent = (eventId) => {
  return {type: REMOVE_EVENT, payload: eventId}
};


//sagas

export const saga = function* () {
    yield all([
        takeEvery(OPEN_EDITOR, openEditorSaga),
        takeEvery(SELECT_EVENT, selectEventSaga),
        takeEvery(GO_BACK, goBackSaga),
        takeEvery(LOAD_EVENTS, getEventsSaga),
        takeEvery(CREATE_NEW_EVENT, createEventSaga),
        takeEvery(UPDATE_EVENT, updateEventSaga),
        takeEvery(REMOVE_EVENT, removeEventSaga),
        takeEvery(GET_EVENT, getEventSaga),
        takeEvery(FIND_EVENT, findEventSaga)
    ])
};

function* findEventSaga(data) {
    try {
        yield put({type: START_REQUEST});
        //todo pase data here
        // const dat

        const date = moment(data.payload),
            year = parseInt(data.payload),
            name = data.payload;

        const response = yield call(findEventBy, {name, year, date})
        console.log('findEventSaga response: ', response)
        yield put({type: SET_FINDED, payload: response});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST})
        console.log(e);
        showErrorMessage(e)
    }
}

function* getEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const event = yield call(getEvent, data.payload);

        yield put({type: SELECT_EVENT, payload: event});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* removeEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const res = yield call(deleteEvent, data.payload);

        console.log('RES', res.Error);

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.log('EEEEE:,', e);
        console.dir(e);
        yield put(showErrorMessage(e.toString()));
    }
}

function* updateEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(updateEvent, data.payload);

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* createEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(createEvent, data.payload);

        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* selectEventSaga(data) {
    try {
        const events = yield select(eventsSelector);
        const eventToSetInEditor = events.find(ev => ev.Id === data.payload);

        if (eventToSetInEditor) {
            yield put({type: SELECT_EVENT, payload: eventToSetInEditor});
        }
    } catch (e) {
        console.log(e);
    }
}

function* openEditorSaga(data) {
    try {
        console.log('openEditorSaga: ', data);
        if (data.payload.eventId || data.payload.timelineId) {
            let event = null;
            if (data.payload.eventId) {
                const events = yield select(eventsSelector);
                event = events.find(ev => ev.Id === data.payload.eventId);
                console.log('event openEditorSaga:, ', event)
                yield put({type: SELECT_EVENT, payload: event});
            } else {
                const date = new Date();
                console.log('data.payload:, ', data.payload)
                if (data.payload.timelineId) {
                    console.log("data.payload.timelineId", data.payload.timelineId);
                    yield put({
                        type: SELECT_EVENT, payload: {
                            Name: '',
                            ShortName: '',
                            Description: '',
                            TlCreationId: data.payload.timelineId,
                            TlPublicId: null,
                            EffDate: date.toLocaleDateString(),
                            Date: date.getDate(),
                            Month: date.getMonth(),
                            Year: date.getFullYear()
                        }
                    });
                } else {
                    console.log("nothing");
                    yield put({
                        type: SELECT_EVENT, payload: {
                            Name: '',
                            ShortName: '',
                            Description: '',
                            TlCreationId: null,
                            TlPublicId: null,
                            EffDate: date.toLocaleDateString(),
                            Date: date.getDate(),
                            Month: date.getMonth(),
                            Year: date.getFullYear()
                        }
                    });
                }
            }

            yield put({type: TOGGLE_EDITOR, payload: true});
        } else {
            const date = new Date();
            yield put({
                type: SELECT_EVENT, payload: {
                    Name: '',
                    ShortName: '',
                    Description: '',
                    TlCreationId: null,
                    TlPublicId: null,
                    EffDate: date.toLocaleDateString(),
                    Date: date.getDay(),
                    Month: date.getMonth(),
                    Year: date.getFullYear()
                }
            });
            yield put({type: TOGGLE_EDITOR, payload: true});
        }
    } catch (e) {
        console.log(e)
    }
}

function* goBackSaga() {
    yield put(push(`/events`))
}

function* getEventsSaga() {
    yield put({type: START_REQUEST});
    try {
        const params = yield select(paramsSelector);
        const events = yield call(getEvents, params);

        //todo map events if it need

        yield put({type: SET_EVENTS, payload: events});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

const findEventBy = ({name, year, date}) => {
    let _urlString = `/api/pm/event-list?Name=${name}&Year=${year}&date=${date}`;
    return commonGetQuery(_urlString);
};

const createEvent = (event) => {
    const dateObject = (event.date && event.month && event.year) ? moment(`${event.year}-${event.month}-${event.date}`) : null;
    const eventData = {
        Name: event.name,
        TlCreationId: event.tlCreationId,
        Date: dateObject,
        Month: event.month,
        Year: event.year,
        ShortName: event.shortName,
        Description: event.description
    };
    console.log('create event');
    console.log(event)
    return fetch("/api/pm/event", {
        method: 'POST',
        headers: {"Content-type": "application/json"},
        credentials: 'include',
        body: JSON.stringify(eventData),
    })
        .then(checkStatus)
        .then(parseJSON)
};

const updateEvent = (event) => {
    const dateObject = (event.date && event.month && event.year) ? moment(`${event.year}-${event.month}-${event.date}`) : null;
    const eventData = {
        Id: event.Id,
        Name: event.name,
        TlCreationId: event.tlCreationId,
        Date: dateObject,
        Month: parseInt(event.month),
        Year: parseInt(event.year),
        ShortName: event.shortName,
        Description: event.description
    };

    return fetch(`/api/pm/event/${event.Id}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(eventData),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const deleteEvent = (eventId) => {
    return fetch(`/api/pm/event/${eventId}`, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json"
        },
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const getEvents = (params) => {
    let _urlString = `/api/pm/event-list${params ? `?${params}` : ''}`;
    return commonGetQuery(_urlString);
};

const getEvent = (id) => {
    return commonGetQuery(`/api/pm/event/${id}`);
};







