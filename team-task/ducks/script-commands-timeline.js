import {appName} from "../config";
import {List, Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, race, select, take, takeEvery} from "@redux-saga/core/effects";
import {MODAL_MESSAGE_ACCEPT, MODAL_MESSAGE_DECLINE, showErrorMessage, showUserConfirmation} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {push} from "react-router-redux/src";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";
import {commonGetQuery} from "tools/fetch-tools";
import {Command} from "../types/script-commands";
import {currentTimelineSelector, getOneTimeline} from "tt-ducks/timelines";
import type {Message} from "../types/messages";
import $ from "jquery";

//constants

export const moduleName = 'script-commands-timeline';
const prefix = `${appName}/${moduleName}`;

//action types
const SET_COMMANDS_REQUEST = `${prefix}/SET_COMMANDS_REQUEST`;
const SET_COMMANDS = `${prefix}/SET_COMMANDS`;
const LOAD_COMMANDS = `${prefix}/LOAD_COMMANDS`;

const START_REQUEST = `${prefix}/START_REQUEST`;
const SUCCESS_REQUEST = `${prefix}/SUCCESS_REQUEST`;
const FAIL_REQUEST = `${prefix}/FAIL_REQUEST`;

const TOGGLE_EDITOR = `${prefix}/TOGGLE_EDITOR`;
const CLOSE_EDITOR_WITH_CONFIRMATION = `${prefix}/CLOSE_EDITOR_WITH_CONFIRMATION`;

const SELECT_COMMAND = `${prefix}/SELECT_COMMAND`;
const UNSELECT_COMMAND = `${prefix}/UNSELECT_COMMAND`;
const OPEN_EDITOR = `${prefix}/OPEN_EDITOR`;
const GO_BACK = `${prefix}/GO_BACK`;

const CREATE_NEW_COMMAND = `${prefix}/CREATE_NEW_COMMAND`;
const UPDATE_COMMAND = `${prefix}/UPDATE_COMMAND`;
const REMOVE_COMMAND = `${prefix}/REMOVE_COMMAND`;
const GET_COMMAND = `${prefix}/GET_COMMAND`;
const FIND_COMMAND = `${prefix}/FIND_COMMAND`;
const SET_FINDED = `${prefix}/SET_FINDED`;
const ADD_TEMPORARY_COMMANDS_REQUEST = `${prefix}/ADD_TEMPORARY_COMMANDS_REQUEST`;
const SET_TEMPORARY_COMMANDS = `${prefix}/SET_TEMPORARY_COMMANDS`;
const CREATE_COMMANDS = `${prefix}/CREATE_COMMANDS`;
const SET_SELECTED_COMMAND = `${prefix}/SET_SELECTED_COMMAND`;


const COMMAND_CODES = {
    0: 'Show',
    1: 'Show',
    2: 'Hide',
    3: 'Hide'
};
//store

const CommandsRecord = List<Command>([]);
const CommandRecord: Command = {};

export const ReducerRecord = Record({
    commands: CommandsRecord,
    fetching: false,
    selectedCommand: CommandRecord,
    editorOpened: false,
    finded: null,
});

// reducer
export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case SET_COMMANDS:
            return state
                .set('commands', payload);
        case START_REQUEST:
            return state
                .set('fetching', true);
        case SUCCESS_REQUEST:
        case FAIL_REQUEST:
            return state
                .set('fetching', false);
        case SET_SELECTED_COMMAND:
            return state
                .set('selectedCommand', payload);
        case UNSELECT_COMMAND:
            return state.set('selectedCommand', payload);
        case TOGGLE_EDITOR:
            return state.set('editorOpened', payload);
        case SET_FINDED:
            return state.set('finded', [...payload]);
        case SET_TEMPORARY_COMMANDS:
            return state.set('commands', [...payload]);
        default:
            return state;
    }
}

//selectors

const stateSelector = state => state[moduleName];

export const currentCommandSelector = createSelector(stateSelector, state => state.selectedCommand);
export const commandsFetchingSelector = createSelector(stateSelector, state => state.fetching);
export const commandsSelector = createSelector(stateSelector, state => state.commands);
export const commandEditorOpenedSelector = createSelector(stateSelector, state => state.editorOpened);
export const findedCommandsSelector = createSelector(stateSelector, state => state.finded);
export const temporaryCommandsSelector = createSelector(stateSelector, state => state.commands);

//actions

export const requestCommands = () => {
    return {type: LOAD_COMMANDS}
};

export const addTemporaryCommand = (command) => {
    return {type: ADD_TEMPORARY_COMMANDS_REQUEST, payload: command}
};

export const setTemporaryCommands = (data) => {
    return {type: SET_TEMPORARY_COMMANDS, payload: data}
};

export const createNewCommand = (command) => {
    return {type: CREATE_NEW_COMMAND, payload: command};
};

export const createCommands = ({commands, timelineId}) => {
    return {type: CREATE_COMMANDS, payload: {commands, timelineId}};
};

export const findCommand = (data, timelineId) => {
    return {type: FIND_COMMAND, payload: {data, timelineId}}
}

export const openCommandEditor = ({commandId = null, command = null, timelineId = null, tableId = null}) => {
    return {type: OPEN_EDITOR, payload: {commandId, timelineId, command, tableId}}
};

export const toggleCommandEditor = (isOn) => {
    return {type: TOGGLE_EDITOR, payload: isOn}
};

export const goBack = () => {
    return {type: GO_BACK}
};

export const updateCommandData = ({commandId, commandData, tableId}) => {
    return {type: UPDATE_COMMAND, payload: {...commandData, Id: commandId, tableId: tableId}}
}

export const removeCommand = (id, timelineId) => {
    return {type: REMOVE_COMMAND, payload: {id, timelineId}}
};

export const setCommands = (commands) => {
    return {type: SET_COMMANDS_REQUEST, payload: commands}
};

export const cleanFound = () => {
    return {type: SET_FINDED, payload: []}
};

export const closeCommandEditorWithConfirmation = () => {
    return {type: CLOSE_EDITOR_WITH_CONFIRMATION}
};

//sagas

export const saga = function* () {
    yield all([
        takeEvery(OPEN_EDITOR, openEditorSaga),
        takeEvery(CLOSE_EDITOR_WITH_CONFIRMATION, closeEditorSaga),
        takeEvery(SELECT_COMMAND, selectCommandSaga),
        takeEvery(GO_BACK, goBackSaga),
        takeEvery(LOAD_COMMANDS, getCommandsSaga),
        takeEvery(CREATE_NEW_COMMAND, createCommandSaga),
        takeEvery(UPDATE_COMMAND, updateCommandSaga),
        takeEvery(REMOVE_COMMAND, removeCommandSaga),
        takeEvery(GET_COMMAND, getCommandSaga),
        takeEvery(FIND_COMMAND, findCommandSaga),
        takeEvery(CREATE_COMMANDS, createCommandsSaga),
        takeEvery(ADD_TEMPORARY_COMMANDS_REQUEST, addTemporaryCommandSaga),
        takeEvery(SET_COMMANDS_REQUEST, setCommandsSaga),
    ])
};

const _getColor = () => { //todo add to helpers/tools
    return "hsl(" + 360 * Math.random() + ',' +
        (55 + 45 * Math.random()) + '%,' +
        (50 + 10 * Math.random()) + '%)'
};

function* closeEditorSaga() {
    try {
        const message: Message = {
            content: `Закрыть без сохранения изменений?`,
            title: "Подтверждение"
        };

        yield put(showUserConfirmation(message));

        const {accept} = yield race({
            accept: take(MODAL_MESSAGE_ACCEPT),
            decline: take(MODAL_MESSAGE_DECLINE)
        });

        if (!accept) return;

        yield put(toggleCommandEditor(false));
    }catch (e)  {
        console.log(e.toString())
    }
}

function* setCommandsSaga({payload}) {
    try {
        const _commands = payload.map((item) => {
            let _command = {...item};

            //todo do mapping when api backend is done

            return _command;
        });

        yield put({type: SET_COMMANDS, payload: _commands})
    } catch (e) {
        console.log(e.toString())
    }

}

function* addTemporaryCommandSaga({payload}) {
    try {
        const _commands = yield select(temporaryCommandsSelector);
        yield put({type: SET_COMMANDS_REQUEST, payload: [..._commands, payload]});
    } catch (e) {
        console.log(e.toString())
    }

}

function* createCommandsSaga(data) {
    try {
        let commandsToCreate = [];

        if (data.payload.commands && data.payload.commands.length > 0) {
            commandsToCreate = data.payload.commands;
        } else {
            commandsToCreate = yield select(temporaryCommandsSelector);
        }

        yield put({type: START_REQUEST});

        if (data.payload.timelineId) {
            const finalCommands = [...commandsToCreate.map(ev => ({...ev, TlCreationId: data.payload.timelineId}))];

            yield all(
                finalCommands.map((ev) => {
                    console.log(ev);
                    return call(createCommand, ev)
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

function* findCommandSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const paramsObject = {};

        if (data.payload.data) {
            if( data.payload.data.Name && data.payload.data.Name.length > 0){
                paramsObject.Name = data.payload.data.Name
            }

            if( parseInt(data.payload.data.Year)){
                paramsObject.Year = parseInt(data.payload.data.Year)
            }

            if( parseInt(data.payload.data.Month)){
                paramsObject.Month = parseInt(data.payload.data.Month)
            }

            if(parseInt(data.payload.data.Day)){
                paramsObject.Day = parseInt(data.payload.data.Day)
            }

            paramsObject.ExcTimelineId = data.payload.timelineId;
        }

        const response = yield call(findCommandBy, $.param(paramsObject));

        const resData = response.map(ev => {
            ev.DisplayDate = `${ev.Year < 0 ? '-' : ''}${ev.Day ? ev.Day.toString().padStart(2, '0') + '.' : ''}${ev.Month ? ev.Month.toString().padStart(2, '0') + '.' : ''}${Math.abs(ev.Year)}`;
            return ev;
        });

        yield put({type: SET_FINDED, payload: resData});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        showErrorMessage(e.message)
    }
}

function* getCommandSaga(data) {
    try {
        yield put({type: START_REQUEST});

        const command = yield call(getCommand, data.payload);

        yield put({type: SELECT_COMMAND, payload: command});
        yield put({type: SUCCESS_REQUEST});
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message));
        console.log(e);
    }
}

function* removeCommandSaga(data) {
    const message: Message = {
        content: `Удалить событие #${data.payload.id}?`,
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

        const res = yield call(deleteCommand, data.payload.id, data.payload.timelineId);


        yield put({type: SUCCESS_REQUEST});
        yield put(getOneTimeline({id: data.payload.timelineId, setToEditor: true}))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.toString()));
    }
}

function* updateCommandSaga(data) {
    try {

        if(data.payload.Id){
            yield put({type: START_REQUEST});

            yield call(updateCommand, data.payload);

            yield put({type: SUCCESS_REQUEST});
        }


        const commands = yield select(commandsSelector);

        const commandToUpdateIndex = commands.findIndex(ev => ev.Id === data.payload.Id);
        const commandToUpdate = commands[commandToUpdateIndex];

        // let updateDataCommand;

        if(commandToUpdate){

            const updateDataCommand = {...commandToUpdate, Id: data.payload.Id,
                Name: data.payload.Name,
                TlCreationId: data.payload.TlCreationId,
                Month: parseInt(data.payload.Month),
                Year: parseInt(data.payload.Year),
                ShortName: data.payload.ShortName,
                Description: data.payload.Description,
                DisplayDate: `${data.payload.Day ? data.payload.Day.toString().padStart(2, '0') + '.' : ''}${data.payload.Month ? data.payload.Month.toString().padStart(2, '0') + '.' : ''}${data.payload.Year}`,
                Day: data.payload.Day ? data.payload.Day : null
            };

            commands.splice(commandToUpdateIndex, 1, updateDataCommand);

            yield put(setCommands([...commands]));
        }
        yield put(toggleCommandEditor(false))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message));
    }
}



function* createCommandSaga(data) {
    try {
        const command = data.payload;
        yield put({type: START_REQUEST});

        const tm = yield select(currentTimelineSelector);

        const mappedCommand = {
            "Code": COMMAND_CODES[toString(command.Command)],
            "TimeCode": command.Timecode * 1000
        };

        if([1,3].includes(command.Command)){
            mappedCommand.Events = command.CommandArguments.map((el, ind) => ({
                Number: ind,
                EventId: el
            }))
        } else {
            if([0,2].includes(command.Command)){
                mappedCommand.Periods = command.CommandArguments.map((el, ind) => ({
                    Number: ind,
                    PeriodId: el
                }))
            }
        }

        yield call(createCommand, tm.timelineId, mappedCommand);

        yield put({type: SUCCESS_REQUEST});

        // yield put(addTemporaryCommand({...data.payload, Id: id, State: 1}))

        yield put(toggleCommandEditor(false))
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(showErrorMessage(e.message));
        console.log(e);
    }
}

function* selectCommandSaga(data) {
    try {

        if (data.payload && data.payload.Id) {
            yield put({type: SET_SELECTED_COMMAND, payload: data.payload});
        }
    } catch (e) {
        console.log(e);
    }
}

function* openEditorSaga(data) {
    try {
        if (data.payload.commandId || data.payload.timelineId) {
            let command = null;
            if (data.payload.commandId) {
                const commands = yield select(commandsSelector);
                command = commands && commands.length > 0 && commands.find(ev => ev.Id === data.payload.commandId);

                if (command) {
                    yield put({type: SET_SELECTED_COMMAND, payload: command});
                } else {
                    if (data.payload.command) {
                        yield put({type: SET_SELECTED_COMMAND, payload: data.payload.command});
                    }
                }
            } else {
                if (data.payload.timelineId) {
                    yield put({
                        type: SET_SELECTED_COMMAND, payload: {
                            Timecode: 0,
                            Command: 0,
                            CommandArguments: []
                        }
                    });
                }
            }

            yield put({type: TOGGLE_EDITOR, payload: true});
        }
    } catch (e) {
        console.log(e)
    }
}

function* goBackSaga() {
    yield put(push(`/commands`))
}

function* getCommandsSaga() {

    try {
        yield put({type: START_REQUEST});
        const params = yield select(paramsSelector);
        const commands = yield call(getCommands, params);

        yield put({type: SET_COMMANDS_REQUEST, payload: commands});
        yield put({type: SUCCESS_REQUEST});
        yield put(clearLocationGuard())
    } catch (e) {
        yield put({type: FAIL_REQUEST});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

const findCommandBy = (paramsObject) => {
    let _urlString = `/api/pm/command-list?${paramsObject}`;
    return commonGetQuery(_urlString);
};

const createCommand = (timelineId, command) => { //todo after api is done
    // let commandData = {
    //     ...command,
    //     Day: +command.Day ? +command.Day : null,
    //     Month: +command.Month ? +command.Month : null,
    //     Year: +command.Year,
    // };

    return fetch(`/api/pm/timeline/add-command/${timelineId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(command),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const updateCommand = (timelineId, command) => { //todo after api is done
    // const commandData = {
    //     ...command,
    //     Day: +command.Day ? +command.Day : null,
    //     Month: +command.Month ? +command.Month : null,
    //     Year: +command.Year,
    // };

    return fetch(`/api/pm/timeline/upd-command/${timelineId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(command),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const deleteCommand = (commandId) => { //todo after api is done
    return fetch(`/api/pm/timeline/delete-command/${commandId}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
};

const getCommands = (params) => {
    let _urlString = `/api/pm/command-list${params ? `?${params}` : ''}`;
    return commonGetQuery(_urlString);
};

const getCommand = (id) => {
    return commonGetQuery(`/api/pm/command/${id}`);
};







