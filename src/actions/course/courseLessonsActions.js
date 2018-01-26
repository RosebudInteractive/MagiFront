import {
    REMOVE_LESSON,
    SELECT_COURSE_LESSON,
    MOVE_LESSON_UP,
    MOVE_LESSON_DOWN,
} from '../../constants/course/courseLessons'


export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COURSE_LESSON,
            payload: id
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_LESSON,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_LESSON_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_LESSON_DOWN,
            payload: id
        });
    }
};