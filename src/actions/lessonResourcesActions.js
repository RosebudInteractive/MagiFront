import {
    SELECT_RESOURCE,
    REMOVE_RESOURCE,
    MOVE_RESOURCE_UP,
    MOVE_RESOURCE_DOWN,
} from '../constants/lessonResources';

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_RESOURCE,
            payload: id
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_RESOURCE,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_RESOURCE_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_RESOURCE_DOWN,
            payload: id
        });
    }
};