import {
    SELECT_TOC,
    INSERT_TOC,
    UPDATE_TOC,
    REMOVE_TOC,
    MOVE_TOC_UP,
    MOVE_TOC_DOWN,
} from '../../constants/episode/episode-tocs';

export const insert = (value) => {
    return (dispatch) => {
        dispatch({
            type: INSERT_TOC,
            payload: value
        });
    }
};

export const update = (value) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_TOC,
            payload: value
        });
    }
};

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_TOC,
            payload: id
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_TOC,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_TOC_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_TOC_DOWN,
            payload: id
        });
    }
};