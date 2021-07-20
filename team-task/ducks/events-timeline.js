import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, race, select, take, takeEvery} from "@redux-saga/core/effects";
import {MODAL_MESSAGE_ACCEPT, MODAL_MESSAGE_DECLINE, showErrorMessage, showUserConfirmation} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {push} from "react-router-redux/src";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import {commonGetQuery} from "tools/fetch-tools";
import {Event} from "../types/events";
import moment from "moment";
import {getOneTimeline} from "tt-ducks/timelines";
import type {Message} from "../types/messages";
import $ from "jquery";

//constants

export const moduleName = 'events-timeline';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_EVENTS_REQUEST = `${prefix}/SET_EVENTS_REQUEST`;
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
const ADD_TEMPORARY_EVENTS_REQUEST = `${prefix}/ADD_TEMPORARY_EVENTS_REQUEST`;
const SET_TEMPORARY_EVENTS = `${prefix}/SET_TEMPORARY_EVENTS`;
const CREATE_EVENTS = `${prefix}/CREATE_EVENTS`;
const SET_SELECTED_EVENT = `${prefix}/SET_SELECTED_EVENT`;
// const UPDATE_EVENT

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
    finded: null,
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
        case SET_SELECTED_EVENT:
            return state
                .set('selectedEvent', payload);
        case UNSELECT_EVENT:
            return state.set('selectedEvent', payload);
        case TOGGLE_EDITOR:
            return state.set('editorOpened', payload);
        case SET_FINDED:
            return state.set('finded', payload);
        case SET_TEMPORARY_EVENTS:
            return state.set('events', payload);
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
export const temporaryEventsSelector = createSelector(stateSelector, state => state.events);

//actions

export const requestEvents = () => {
    return {type: LOAD_EVENTS}
};

export const addTemporaryEvent = (event) => {
    return {type: ADD_TEMPORARY_EVENTS_REQUEST, payload: event}
};

export const setTemporaryEvents = (data) => {
    return {type: SET_TEMPORARY_EVENTS, payload: data}
};

export const createNewEvent = (event) => {
    return {type: CREATE_NEW_EVENT, payload: event};
};

export const createEvents = ({events, timelineId}) => {
    return {type: CREATE_EVENTS, payload: {events, timelineId}};
};

export const findEvent = (data) => {
    return {type: FIND_EVENT, payload: data}
}

export const openEventEditor = ({eventId = null, event = null, timelineId = null}) => {
    return {type: OPEN_EDITOR, payload: {eventId, timelineId, event}}
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

export const setEvents = (events) => {
    return {type: SET_EVENTS_REQUEST, payload: events}
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
        takeEvery(FIND_EVENT, findEventSaga),
        takeEvery(CREATE_EVENTS, createEventsSaga),
        takeEvery(ADD_TEMPORARY_EVENTS_REQUEST, addTemporaryEventSaga),
        takeEvery(SET_EVENTS_REQUEST, setEventsSaga),
    ])
};

const _getColor = () => { //todo add to helpers/tools
    return "hsl(" + 360 * Math.random() + ',' +
        (55 + 45 * Math.random()) + '%,' +
        (50 + 10 * Math.random()) + '%)'
}

function* setEventsSaga({payload}) {
    const _events = payload.map((item) => {
        let _event = {...item};

        _event.year = item.Year ? item.Year : new Date(item.Date).getFullYear()
        _event.name = item.Name
        _event.date = item.Date ? new Date(item.Date).toLocaleDateString("ru-Ru") : `${item.Month ? item.Month + '.' : ''}${item.Year}`
        _event.color = _getColor()

        return _event
    })

    yield put({type: SET_EVENTS, payload: _events})
}

function* addTemporaryEventSaga({payload}) {
    const _events = yield select(temporaryEventsSelector);

    const newEvent = {
        ...payload,
        Date: payload.date,
        Description: payload.description,
        Month: payload.month,
        Name: payload.name,
        ShortName: payload.shortName,
        Year: payload.year,
        State: 1
    };

    yield put({type: SET_EVENTS_REQUEST, payload: [..._events, newEvent]});
}

function* createEventsSaga(data) {
    try {
        let eventsToCreate = [];

        if (data.payload.events && data.payload.events.length > 0) {
            eventsToCreate = data.payload.events;
        } else {
            eventsToCreate = yield select(temporaryEventsSelector);
        }

        yield put({type: START_REQUEST});

        if (data.payload.timelineId) {
            const finalEvents = [...eventsToCreate.map(ev => ({...ev, TlCreationId: data.payload.timelineId}))];

            yield all(
                finalEvents.map((ev) => {
                    console.log(ev);
                    return call(createEvent, ev)
                })
            );
        }

        yield put({type: SUCCESS_REQUEST});
        yield put(getOneTimeline({id: data.payload.timelineId, setToEditor: true}))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        console.log(e);
        yield put(showErrorMessage(e.toString()))
    }
}

function* findEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const paramsObject = {};

        const numberDate = parseInt(data.payload);

        if (!isNaN(numberDate)) {
            paramsObject.Date = numberDate;
            paramsObject.Year = numberDate;
        } else {
            paramsObject.Name = data.payload;
        }

        const response = yield call(findEventBy, $.param(paramsObject));
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
    const message: Message = {
        content: `Удалить событие #${data.payload}?`,
        title: "Подтверждение удаления"
    };

    yield put(showUserConfirmation(message))

    const {accept} = yield race({
        accept: take(MODAL_MESSAGE_ACCEPT),
        decline: take(MODAL_MESSAGE_DECLINE)
    });

    if (!accept) return;

    try {
        yield put({type: START_REQUEST});

        const res = yield call(deleteEvent, data.payload);


        yield put({type: SUCCESS_REQUEST});
        yield put(getOneTimeline({id: data.payload.tlCreationId, setToEditor: true}))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.toString()));
    }
}

function* updateEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        yield call(updateEvent, data.payload);

        yield put({type: SUCCESS_REQUEST});

        const events = yield select(eventsSelector);

        const eventToUpdateIndex = events.findIndex(ev => ev.Id === data.payload.Id);
        const eventToUpdate = events[eventToUpdateIndex];

        // let updateDataEvent;

        if(eventToUpdate){
            const dateObject = (data.payload.date && data.payload.month && data.payload.year) ? moment(`${data.payload.year}-${data.payload.month}-${data.payload.date}`) : null;
            const updateDataEvent = {...eventToUpdate, Id: data.payload.Id,
                Name: data.payload.name,
                TlCreationId: data.payload.tlCreationId,
                Date: dateObject,
                Month: parseInt(data.payload.month),
                Year: parseInt(data.payload.year),
                ShortName: data.payload.shortName,
                Description: data.payload.description};

            events.splice(eventToUpdateIndex, 1, updateDataEvent);

            console.log('events updateEventSaga: ', events)

            yield put(setTemporaryEvents(events));
        }
        // console.log('if (event) {');
        // yield put({type: SET_SELECTED_EVENT, payload: data.payload.event});
        yield put(getOneTimeline({id: data.payload.tlCreationId, setToEditor: true})) //todo remove it later
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* createEventSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const {id} = yield call(createEvent, data.payload);

        yield put({type: SUCCESS_REQUEST});

        yield put(getOneTimeline({id: data.payload.TlCreationId, setToEditor: true})); //todo remove it later
        yield put(addTemporaryEvent({...data.payload, Id: id}))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e));
        console.log(e);
    }
}

function* selectEventSaga(data) {
    try {

        if (data.payload && data.payload.Id) {
            yield put({
                type: SET_SELECTED_EVENT, payload: {
                    ...data.payload,
                    Name: (data.payload && data.payload.name) ? data.payload.name : '',
                    ShortName: (data.payload && data.payload.shortName) ? data.payload.shortName : '',
                    Description: (data.payload && data.payload.description) ? data.payload.description : ''
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
}

function* openEditorSaga(data) {
    try {
        if (data.payload.eventId || data.payload.timelineId) {
            let event = null;
            if (data.payload.eventId) {
                const events = yield select(eventsSelector);
                event = events && events.length > 0 && events.find(ev => ev.Id === data.payload.eventId);

                if (event) {
                    console.log('if (event) {');
                    yield put({type: SET_SELECTED_EVENT, payload: data.payload.event});
                } else {
                    if (data.payload.event) {
                        yield put({type: SET_SELECTED_EVENT, payload: data.payload.event});
                    }
                }
            } else {
                const date = new Date();
                if (data.payload.timelineId) {
                    yield put({
                        type: SET_SELECTED_EVENT, payload: {
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
                    yield put({
                        type: SET_SELECTED_EVENT, payload: {
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
                type: SET_SELECTED_EVENT, payload: {
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

const findEventBy = (paramsObject) => {
    let _urlString = `/api/pm/event-list?${paramsObject}`;
    return commonGetQuery(_urlString);
};

const createEvent = (event) => {
    const dateObject = (event.Date && event.Month && event.Year) ? moment(`${event.Year}-${event.Month}-${event.Date}`) : null;
    let eventData = {
        Name: event.Name,
        TlCreationId: event.TlCreationId,
        Date: dateObject,
        Month: event.Month,
        Year: event.Year,
        ShortName: event.ShortName,
        Description: event.Description
    };

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







