import {
    ADD_AUTHOR,
    REMOVE_AUTHOR,
    SELECT_COURSE_AUTHOR,
    SHOW_ADD_AUTHOR_DIALOG,
    HIDE_ADD_AUTHOR_DIALOG,
} from '../../constants/course/courseAuthor'

export const showAddDialog = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_ADD_AUTHOR_DIALOG,
            payload: null
        });
    }
};

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COURSE_AUTHOR,
            payload: id
        });
    }
};

export const add = (id) => {
    return (dispatch) => {
        dispatch({
            type: ADD_AUTHOR,
            payload: id
        });

        dispatch({
            type: SELECT_COURSE_AUTHOR,
            payload: id
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_AUTHOR,
            payload: id
        });
    }
};

export const hideAddDialog = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_ADD_AUTHOR_DIALOG,
            payload: null
        });
    }
};