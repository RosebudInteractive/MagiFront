import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
    HIDE_LESSON_MENU,
    SHOW_LESSON_MENU,
} from '../constants/app'

const initialState = {
    size: null,
    showSmallPlayer: false,
    isLessonMenuOpened: false,
};

export default function app(state = initialState, action) {

    switch (action.type) {
        case SWITCH_SIZE_TO:
            return {...state, size: action.payload};

        case SWITCH_TO_SMALL_PLAYER:
            // if (state.showSmallPlayer !== action.payload) {
            //     return {...state, showSmallPlayer: true};
            // } else {
            //     return state
            // }
            return state

        case SWITCH_TO_FULL_PLAYER:
            if (state.showSmallPlayer !== action.payload) {
                return {...state, showSmallPlayer: false};
            } else {
                return state
            }

        case SHOW_LESSON_MENU:
            if (state.isLessonMenuOpened !== action.payload) {
                return {...state, isLessonMenuOpened: true};
            } else {
                return state
            }

        case HIDE_LESSON_MENU:
            if (state.isLessonMenuOpened !== action.payload) {
                return {...state, isLessonMenuOpened: false};
            } else {
                return state
            }

        default:
            return state;
    }
}