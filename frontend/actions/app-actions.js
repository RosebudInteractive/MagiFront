import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    DUMMY_SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
    HIDE_LESSON_MENU,
    SHOW_LESSON_MENU,
    SET_APP_TYPE_MOBILE,
    SHOW_USER_BLOCK,
    HIDE_USER_BLOCK, SHOW_LESSONS_BOOKMARKS, SHOW_COURSES_BOOKMARKS,
} from '../constants/app'

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