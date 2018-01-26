import {
    SELECT_RECOMMENDED_REFERENCE,
    INSERT_RECOMMENDED_REFERENCE,
    UPDATE_RECOMMENDED_REFERENCE,
    REMOVE_RECOMMENDED_REFERENCE,
    MOVE_RECOMMENDED_REFERENCE_UP,
    MOVE_RECOMMENDED_REFERENCE_DOWN,
} from '../../constants/lesson/lessonRecommendedRefs';

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_RECOMMENDED_REFERENCE,
            payload: id
        });
    }
};

export const insert = (value) => {
    return (dispatch) => {
        dispatch({
            type: INSERT_RECOMMENDED_REFERENCE,
            payload: value
        });
    }
};

export const update = (value) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_RECOMMENDED_REFERENCE,
            payload: value
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_RECOMMENDED_REFERENCE,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_RECOMMENDED_REFERENCE_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_RECOMMENDED_REFERENCE_DOWN,
            payload: id
        });
    }
};