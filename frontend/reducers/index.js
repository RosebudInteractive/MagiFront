import {combineReducers} from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form'
import pageHeader from './page-header';
import courses from './courses';
import filters from './filters';
import singleCourse from './singleCourse';
import singleLesson from './singleLesson';
import lessons from './lessons';
import lessonText from './lessonText';
import lessonPlayInfo from './lesson-play-info';
import app from './app';
import player from './player';
import user from './user'
import lessonInfoStorage from './lesson-info-storage';
import authorReducer, {moduleName as authorModule} from 'ducks/author'
import profileReducer, {moduleName as profileModule} from 'ducks/profile'
import playerScreenReducer, {moduleName as playerScreenModule} from 'ducks/player-screen'
import messageReducer, {moduleName as messageModule} from 'ducks/message'
import filtersReducer, {moduleName as filtersModule} from 'ducks/filters'
import billingReducer, {moduleName as billingModule} from 'ducks/billing'
import paramsReducer, {moduleName as paramsModule} from 'ducks/params'
import versionReducer, {moduleName as versionModule} from 'ducks/version'
import appReducer, {moduleName as appModule} from 'ducks/app'
import playerReducer, {moduleName as playerModule} from 'ducks/player'
import GoogleAnalyticsReducer, {moduleName as GoogleAnalyticsModule} from 'ducks/google-analytics'
import TestReducer, {moduleName as TestModule} from 'ducks/test'
import TestInstanceReducer, {moduleName as TestInstanceModule} from 'ducks/test-instance'
import TestResultReducer, {moduleName as TestResultModule} from 'ducks/test-result'

export default combineReducers({

    pageHeader,
    courses,
    filters,
    app,
    singleCourse,
    singleLesson,
    lessons,
    lessonText,
    lessonPlayInfo,
    player,
    lessonInfoStorage,
    user,
    [authorModule]: authorReducer,
    [profileModule]: profileReducer,
    [playerScreenModule]: playerScreenReducer,
    [messageModule]: messageReducer,
    [filtersModule]: filtersReducer,
    [billingModule]: billingReducer,
    [paramsModule]: paramsReducer,
    [versionModule]: versionReducer,
    [appModule]: appReducer,
    [playerModule]: playerReducer,
    [GoogleAnalyticsModule]: GoogleAnalyticsReducer,
    [TestModule]: TestReducer,
    [TestInstanceModule]: TestInstanceReducer,
    [TestResultModule]: TestResultReducer,
    routing: routerReducer,
    form: formReducer,
})
