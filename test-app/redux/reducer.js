import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux';
import {reducer as formReducer} from "redux-form";
import user from '../../frontend/reducers/user'
import appReducer, {moduleName as appModule} from 'ducks/app'
import TestReducer, {moduleName as TestModule} from "ducks/test";
import TestInstanceReducer, {moduleName as TestInstanceModule} from "ducks/test-instance";
import TestResultReducer, {moduleName as TestResultModule} from "ducks/test-result";
import LessonMenuReducer, {moduleName as LessonMenuModule} from "ducks/lesson-menu";
import app from "../../frontend/reducers/app";
import billingReducer, {moduleName as billingModule} from "ducks/billing";
import messageReducer, {moduleName as messageModule} from "ducks/message";
import profileReducer, {moduleName as profileModule} from "ducks/profile";


export default combineReducers({
    user,
    app,
    [appModule]: appReducer,
    [TestModule]: TestReducer,
    [TestInstanceModule]: TestInstanceReducer,
    [TestResultModule]: TestResultReducer,
    [LessonMenuModule]: LessonMenuReducer,
    [billingModule]: billingReducer,
    [messageModule]: messageReducer,
    [profileModule]: profileReducer,

    routing: routerReducer,
    form: formReducer,
})
