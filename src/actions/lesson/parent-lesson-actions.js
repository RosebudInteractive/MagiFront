import {
    SET_PARENT_LESSON,
    CLEAR_PARENT_LESSON,
} from '../../constants/lesson/singleLesson'

export const set = (lesson) => {
    return (dispatch) => {
        dispatch({
            type: SET_PARENT_LESSON,
            payload: lesson
        });
    }
};

export const clear = ()=> {
    return (dispatch) => {
        dispatch({
            type: CLEAR_PARENT_LESSON,
            payload: null
        });
    }
};