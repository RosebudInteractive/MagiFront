import {combineReducers} from 'redux';
// import {responsiveStateReducer} from 'redux-responsive';
import pageHeader from './page-header';
import courses from './courses';
import filters from './filters';
// import { routerReducer } from 'react-router-redux';


export default combineReducers({

    pageHeader,
    courses,
    filters,
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
