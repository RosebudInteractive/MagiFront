import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
    HIDE_LESSON_MENU,
    SHOW_LESSON_MENU,
} from '../constants/app'

export const switchSizeTo = (size) => {
    return {
        type: SWITCH_SIZE_TO,
        payload: size
    }
};

export const switchToSmallPlayer = () => {
    return {
        type: SWITCH_TO_SMALL_PLAYER,
        payload: null
    }
}

export const switchToFullPlayer = () => {
    return {
        type: SWITCH_TO_FULL_PLAYER,
        payload: null
    }
}

export const hideLessonMenu = (id) => {
    return {
        type: HIDE_LESSON_MENU,
        payload: id
    }
}

export const showLessonMenu = (id) => {
    return {
        type: SHOW_LESSON_MENU,
        payload: id
    }
}