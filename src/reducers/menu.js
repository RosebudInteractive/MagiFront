/**
 * Created by levan.kiknadze on 11/11/2017.
 */

import {
    SELECT_ITEM,
    // MENU_ITEM_EPISODES,
    // MENU_ITEM_OTHER,
    MENU_ITEM_NONE,
    MENU_ITEM_AUTHOR,
    MENU_ITEM_CATEGORIES,
    MENU_ITEM_COURSES,
} from '../constants/Menu'


const initialState = {
    selected: MENU_ITEM_NONE,
    items: [
        {id: 'HOME', name: "Домой", url: "/adm"},
        {id: MENU_ITEM_AUTHOR, name: "Авторы", url:'/adm/authors'},
        {id: MENU_ITEM_CATEGORIES, name : 'Категории' , url : '/adm/categories'},
        {id: MENU_ITEM_COURSES, name : 'Курсы' , url : '/adm/courses'},
        // {id: MENU_ITEM_EPISODES, name: "Эпизоды", url: "/episodes"},
        // {id: MENU_ITEM_OTHER, name: "Что-то еще", url: "/photos"}
    ]
};

export default function menu(state = initialState, action) {
    switch (action.type) {
        case SELECT_ITEM:
            return { ...state, selected: action.payload };
        default:
            return state;
    }
}
