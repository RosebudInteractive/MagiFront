import {combineReducers} from 'redux';
import { routerReducer } from 'react-router-redux';
import pageHeader from './page-header';
import courses from './courses';
import filters from './filters';
import singleCourse from './singleCourse';
import singleLesson from './singleLesson';
import lessons from './lessons';
import lessonText from './lessonText';
import lessonPlayInfo from './lessonPlayInfo';
import app from './app';
// import { routerReducer } from 'react-router-redux';


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
    routing: routerReducer,
    // browser: responsiveStateReducer({
    //     mobile: 500,
    //     xxs: 640,
    //     xs: 768,
    //     s: 900,
    //     m: 1024,
    //     l: 1280,
    //     xl: 1400,
    //     xxl: 1900,
    // }),
})
