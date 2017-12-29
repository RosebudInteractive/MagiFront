import {
    CREATE_TOC,
    SELECT_TOC,
    REMOVE_TOC,
    MOVE_TOC_UP,
    MOVE_TOC_DOWN,
} from '../../constants/episode/episodeToc';

export const create = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_TOC,
            payload: null
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