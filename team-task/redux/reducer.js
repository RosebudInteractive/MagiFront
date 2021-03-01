import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';
import {reducer as formReducer} from "redux-form";
import authReducer, {moduleName as authModule} from "tt-ducks/auth";
import tasksReducer, {moduleName as tasksModule} from "tt-ducks/tasks";
import processesReducer, {moduleName as processesModule} from "tt-ducks/processes";
import routeReducer, {moduleName as routeModule} from "tt-ducks/route";

export default combineReducers({
    [authModule]: authReducer,
    [tasksModule]: tasksReducer,
    [processesModule]: processesReducer,
    [routeModule]: routeReducer,

    routing: routerReducer,
    form: formReducer,
})
