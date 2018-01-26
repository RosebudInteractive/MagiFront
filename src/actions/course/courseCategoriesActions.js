import {
    ADD_CATEGORY,
    REMOVE_CATEGORY,
    SELECT_COURSE_CATEGORY,
    SHOW_ADD_CATEGORY_DIALOG,
    HIDE_ADD_CATEGORY_DIALOG,
} from '../../constants/course/courseCategory';

export const showAddDialog = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_ADD_CATEGORY_DIALOG,
            payload: null
        });
    }
};

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COURSE_CATEGORY,
            payload: id
        });
    }
};

export const add = (id) => {
    return (dispatch) => {
        dispatch({
            type: ADD_CATEGORY,
            payload: id
        });

        dispatch({
            type: SELECT_COURSE_CATEGORY,
            payload: id
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_CATEGORY,
            payload: id
        });
    }
};

export const hideAddDialog = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_ADD_CATEGORY_DIALOG,
            payload: null
        });
    }
};