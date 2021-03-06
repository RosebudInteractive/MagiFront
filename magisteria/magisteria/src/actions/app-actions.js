import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    DUMMY_SWITCH_TO_SMALL_PLAYER,
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
    ENABLE_BILLING, DISABLE_BILLING, GET_COOKIES_CONFIRMATION, CONFIRM_COOKIES
} from '../constants/app'

import $ from 'jquery'
import 'jquery.cookie'

export const switchSizeTo = (size) => {
    return {
        type: SWITCH_SIZE_TO,
        payload: size
    }
};

export const switchToSmallPlayer = () => {
    return (dispatch, getState) => {
        let _playerState = getState().player

        if (!_playerState.paused) {
            dispatch({
                type: SWITCH_TO_SMALL_PLAYER,
                payload: null
            });
        } else {
            dispatch({
                type: DUMMY_SWITCH_TO_SMALL_PLAYER,
                payload: null
            })
        }
    }
}

export const switchToFullPlayer = () => {
    return {
        type: SWITCH_TO_FULL_PLAYER,
        payload: null
    }
}

export const hideLessonMenu = () => {
    return {
        type: HIDE_LESSON_MENU,
        payload: null
    }
}

export const showLessonMenu = () => {
    return {
        type: SHOW_LESSON_MENU,
        payload: null
    }
}

export const setAppTypeMobile = () => {
    return {
        type: SET_APP_TYPE_MOBILE,
        payload: null
    }
}

export const showUserBlock = () => {
    return {
        type: SHOW_USER_BLOCK,
        payload: null
    }
};

export const hideUserBlock = () => {
    return {
        type: HIDE_USER_BLOCK,
        payload: null
    }
};

export const showLessonsBookmarks = () => {
    return {
        type: SHOW_LESSONS_BOOKMARKS,
        payload: null
    }
};

export const showCoursesBookmarks = () => {
    return {
        type: SHOW_COURSES_BOOKMARKS,
        payload: null
    }
};

export const showSizeInfo = () => {
    return {
        type: SHOW_SIZE_INFO,
        payload: null
    }
};

export const hideSizeInfo = () => {
    return {
        type: HIDE_SIZE_INFO,
        payload: null
    }
};

export const openGallery = () => {
    return {
        type: OPEN_GALLERY,
        payload: null
    }
};

export const closeGallery = () => {
    return {
        type: CLOSE_GALLERY,
        payload: null
    }
};

export const enableBilling = () => {
    return {
        type: ENABLE_BILLING,
        payload: null
    }
}

export const disableBilling = () => {
    return {
        type: DISABLE_BILLING,
        payload: null
    }
}

export const getAppOptions = () => {
    return (dispatch) => {
        dispatch({
            type: GET_APP_OPTIONS_REQUEST,
            payload: null
        });

        fetch("/api/options", {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: GET_APP_OPTIONS_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_APP_OPTIONS_FAIL,
                    payload: err
                });
            });
    }
};

const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error
    }
};

const parseJSON = (response) => {
    return response.json()
};

