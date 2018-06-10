import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
    HIDE_LESSON_MENU,
    SHOW_LESSON_MENU,
    SET_APP_TYPE_MOBILE,
    SHOW_USER_BLOCK,
    HIDE_USER_BLOCK,
} from '../constants/app'

import {
    SHOW_SIGN_IN_FORM,
    CLOSE_SIGN_IN_FORM,
} from '../constants/user'

const initialState = {
    size: null,
    showSmallPlayer: false,
    isLessonMenuOpened: false,
    isMobileApp: false,
    showSignInForm: false,
    showUserBlock: false,
};

export default function app(state = initialState, action) {

    switch (action.type) {

        case SHOW_USER_BLOCK:
            return {...state, showUserBlock: true};

        case HIDE_USER_BLOCK:
                    return {...state, showUserBlock: false};


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

        case SET_APP_TYPE_MOBILE: {
            return {...state, isMobileApp: true}
        }

        case SHOW_SIGN_IN_FORM: {
            return {...state, showSignInForm: true}
        }

        case CLOSE_SIGN_IN_FORM: {
            return {...state, showSignInForm: false}
        }

        default:
            return state;
    }
}