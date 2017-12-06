import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';

import page from "./page"
import user from "./user"
import menu from "./menu"
import episodes from "./episodes"

export default combineReducers({
    page,
    user,
    menu,
    episodes,
    routing: routerReducer,
})