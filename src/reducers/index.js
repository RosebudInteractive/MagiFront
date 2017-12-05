import { combineReducers } from 'redux'
import page from "./page"
import user from "./user"
import menu from "./menu"
import episodes from "./episodes"
import authors from './authors';

export default combineReducers({
    page,
    user,
    menu,
    episodes,
    authors,
})