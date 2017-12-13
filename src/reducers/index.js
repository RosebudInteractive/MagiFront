import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';

import page from "./page"
import user from "./user"
import menu from "./menu"
import commonDlg from './commonDlg';
import episodes from "./episodes"
import authors from './authors';
import categories from './categories';
import courses from './courses';
import singleCourse from './singleCourse';
import singleLesson from './singleLesson';
import languages from './languages';
import courseAuthors from './courseAuthors';

export default combineReducers({
    page,
    user,
    menu,
    commonDlg,
    episodes,
    languages,
    authors,
    categories,
    courses,
    singleCourse,
    courseAuthors,
    singleLesson,
    routing: routerReducer,
})