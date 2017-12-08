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

export default combineReducers({
    page,
    user,
    menu,
    commonDlg,
    episodes,
    authors,
    categories,
    courses,
    routing: routerReducer,
})