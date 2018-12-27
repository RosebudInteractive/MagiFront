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
    GET_APP_OPTIONS_REQUEST,
    GET_APP_OPTIONS_SUCCESS,
    GET_APP_OPTIONS_FAIL,
    ENABLE_BILLING,
    DISABLE_BILLING,
    GET_COOKIES_CONFIRMATION,
    CONFIRM_COOKIES,
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
    sendPulseScript: null,
    billingTest: false,
    enabledBilling: false,
    fetching: false,
    cookiesConfirmed: false,
};

export default function app(state = initialState, action) {
    const {type, payload} = action


    switch (type) {

        case SHOW_USER_BLOCK:
            return {...state, showUserBlock: true};

        case HIDE_USER_BLOCK: {
            if (state.showUserBlock) {
                return {...state, showUserBlock: false};
            } else {
                return state
            }
        }


        case SWITCH_SIZE_TO:
            return {...state, size: payload};

        case SWITCH_TO_SMALL_PLAYER:
            // if (state.showSmallPlayer !== action.payload) {
            //     return {...state, showSmallPlayer: true};
            // } else {
            //     return state
            // }
            return state

        case SWITCH_TO_FULL_PLAYER:
            if (state.showSmallPlayer !== payload) {
                return {...state, showSmallPlayer: false};
            } else {
                return state
            }

        case SHOW_LESSON_MENU:
            if (state.isLessonMenuOpened !== payload) {
                return {...state, isLessonMenuOpened: true};
            } else {
                return state
            }

        case HIDE_LESSON_MENU:
            if (state.isLessonMenuOpened !== payload) {
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

        case GET_APP_OPTIONS_REQUEST: {
            return {...state, fetching: true}
        }

        case GET_APP_OPTIONS_SUCCESS: {
            let _sendPulse = (payload.scriptPath && payload.scriptPath.sendPulse) ? payload.scriptPath.sendPulse : null,
                _buildingTest = (payload.billing && payload.billing.billing_test) ? payload.billing.billing_test : false;

            return {
                ...state,
                billingTest: _buildingTest,
                facebookAppID: payload.appId.fb,
                reCapture: payload.siteKey.reCapture,
                sendPulseScript: _sendPulse,
                fetching: false,
            }
        }

        case GET_APP_OPTIONS_FAIL: {
            return {...state, facebookAppID: '', fetching: false}
        }

        case ENABLE_BILLING: {
            return {...state, enabledBilling: true}
        }

        case DISABLE_BILLING: {
            return {...state, enabledBilling: false}
        }

        case GET_COOKIES_CONFIRMATION: {
            return {...state, cookiesConfirmed: (action.payload !== undefined) ? action.payload : false}
        }

        case CONFIRM_COOKIES: {
            return {...state, cookiesConfirmed: true}
        }

        default:
            return state;
    }
}