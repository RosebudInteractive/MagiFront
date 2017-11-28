/**
 * Created by levan.kiknadze on 11/11/2017.
 */

import {
    SELECT_ITEM,
    MENU_ITEM_EPISODES,
    MENU_ITEM_OTHER,
    MENU_ITEM_NONE
} from '../constants/Menu'


const initialState = {
    selected: MENU_ITEM_NONE,
    items: [
        {id: MENU_ITEM_EPISODES, name: "Эпизоды"},
        {id: MENU_ITEM_OTHER, name: "Что-то еще"}
    ]
}

export default function menu(state = initialState, action) {
    switch (action.type) {
        case SELECT_ITEM:
            return { ...state, selected: action.payload }
        default:
            return state;
    }
}
