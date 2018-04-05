import {
    SELECT_COMMON_REFERENCE,
    INSERT_COMMON_REFERENCE,
    UPDATE_COMMON_REFERENCE,
    REMOVE_COMMON_REFERENCE,
    MOVE_COMMON_REFERENCE_UP,
    MOVE_COMMON_REFERENCE_DOWN,
} from '../../constants/lesson/lessonCommonRefs';

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COMMON_REFERENCE,
            payload: id
        });
    }
};

export const insert = (value) => {
    return (dispatch) => {
        dispatch({
            type: INSERT_COMMON_REFERENCE,
            payload: value
        });
    }
};

export const update = (value) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_COMMON_REFERENCE,
            payload: value
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_COMMON_REFERENCE,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_COMMON_REFERENCE_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_COMMON_REFERENCE_DOWN,
            payload: id
        });
    }
};