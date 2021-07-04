import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux';
import {reducer as formReducer} from "redux-form";
import appReducer, {moduleName as appModule} from "tt-ducks/app";
import authReducer, {moduleName as authModule} from "tt-ducks/auth";
import taskReducer, {moduleName as taskModule} from "tt-ducks/task";
import tasksReducer, {moduleName as tasksModule} from "tt-ducks/tasks";
import processTaskReducer, {moduleName as processTaskModule} from "tt-ducks/process-task";
import processReducer, {moduleName as processModule} from "tt-ducks/process";
import processesReducer, {moduleName as processesModule} from "tt-ducks/processes";
import routeReducer, {moduleName as routeModule} from "tt-ducks/route";
import messageReducer, {moduleName as messageModule} from "tt-ducks/messages";
import usersDictionaryReducer, {moduleName as usersDictionaryModule} from "tt-ducks/users-dictionary";
import componentsDictionaryReducer, {moduleName as componentDictionaryModule} from "tt-ducks/components-dictionary";
import dictionaryReducer, {moduleName as dictionaryModule} from "tt-ducks/dictionary";
import notificationsReducer, {moduleName as notificationsModule} from "tt-ducks/notifications";
import timelinesReducer, {moduleName as timelinesModule} from "tt-ducks/timelines";

export default combineReducers({
    [appModule]: appReducer,
    [authModule]: authReducer,
    [taskModule]: taskReducer,
    [tasksModule]: tasksReducer,
    [processTaskModule]: processTaskReducer,
    [processModule]: processReducer,
    [processesModule]: processesReducer,
    [routeModule]: routeReducer,
    [messageModule]: messageReducer,
    [usersDictionaryModule]: usersDictionaryReducer,
    [dictionaryModule]: dictionaryReducer,
    [componentDictionaryModule]: componentsDictionaryReducer,
    [notificationsModule]: notificationsReducer,
    [timelinesModule]: timelinesReducer,

    routing: routerReducer,
    form: formReducer,
})
