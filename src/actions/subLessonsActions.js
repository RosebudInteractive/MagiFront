import {
    SELECT_SUB_LESSON,
    REMOVE_SUB_LESSON,
    MOVE_SUB_LESSON_UP,
    MOVE_SUB_LESSON_DOWN,
} from '../constants/subLessons';

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_SUB_LESSON,
            payload: id
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_SUB_LESSON,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_SUB_LESSON_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_SUB_LESSON_DOWN,
            payload: id
        });
    }
};