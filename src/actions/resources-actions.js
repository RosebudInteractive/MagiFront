import {
    CREATE_RESOURCE,
    EDIT_RESOURCE,
    CLEAR_RESOURCE,
} from '../constants/lesson/lessonResources';

export const create = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_RESOURCE,
            payload: null
        });
    }
};

export const edit = (value) => {
    return (dispatch) => {
        dispatch({
            type: EDIT_RESOURCE,
            payload: value
        });
    }
};

export const clear = (value) => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_RESOURCE,
            payload: value
        });
    }
};