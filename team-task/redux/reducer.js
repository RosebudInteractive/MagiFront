import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';
import {reducer as formReducer} from "redux-form";
import authReducer, {moduleName as authModule} from "tt-ducks/auth";
import taskReducer, {moduleName as taskModule} from "tt-ducks/task";
import tasksReducer, {moduleName as tasksModule} from "tt-ducks/tasks";
import processReducer, {moduleName as processModule} from "tt-ducks/process";
import processesReducer, {moduleName as processesModule} from "tt-ducks/processes";
import routeReducer, {moduleName as routeModule} from "tt-ducks/route";

export default combineReducers({
    [authModule]: authReducer,
    [taskModule]: taskReducer,
    [tasksModule]: tasksReducer,
    [processModule]: processReducer,
    [processesModule]: processesReducer,
    [routeModule]: routeReducer,

    routing: routerReducer,
    form: formReducer,
})
