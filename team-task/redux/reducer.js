import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';
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

    routing: routerReducer,
    form: formReducer,
})