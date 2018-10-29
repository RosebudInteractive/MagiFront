import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
    HIDE_LESSON_MENU,
    SHOW_LESSON_MENU,
    SET_APP_TYPE_MOBILE,
    SHOW_USER_BLOCK,
    HIDE_USER_BLOCK,
    SHOW_LESSONS_BOOKMARKS,
    SHOW_COURSES_BOOKMARKS,
    SHOW_SIZE_INFO,
    HIDE_SIZE_INFO,
    OPEN_GALLERY,
    CLOSE_GALLERY,
    GET_APP_OPTIONS_SUCCESS,
    GET_APP_OPTIONS_FAIL,
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
    showLessonBookmarks: false,
    showCourseBookmarks: true,
    showSizeInfo: false,
    galleryIsOpen: false,
    facebookAppID: '',
    reCapture: '',
    sendPulseScript: '',
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

        case SHOW_LESSONS_BOOKMARKS: {
            return {...state, showLessonBookmarks: true, showCourseBookmarks: false}
        }

        case SHOW_COURSES_BOOKMARKS: {
            return {...state, showLessonBookmarks: false, showCourseBookmarks: true}
        }

        case SHOW_SIZE_INFO: {
            return {...state, showSizeInfo: true}
        }

        case HIDE_SIZE_INFO: {
            return {...state, showSizeInfo: false}
        }

        case OPEN_GALLERY: {
            return {...state, galleryIsOpen: true}
        }

        case CLOSE_GALLERY: {
            return {...state, galleryIsOpen: false}
        }

        case GET_APP_OPTIONS_SUCCESS: {
            return {...state,
                facebookAppID: action.payload.appId.fb,
                reCapture: action.payload.siteKey.reCapture,
                sendPulseScript: "//cdn.sendpulse.com/js/push/700d4d64866e5acf0b24dfead24eac1d_1.js",
            }
        }

        case GET_APP_OPTIONS_FAIL: {
            return {...state, facebookAppID: ''}
        }

        default:
            return state;
    }
}