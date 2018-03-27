import {
    CREATE_TOC,
    EDIT_TOC,
    CLEAR_TOC,
} from '../constants/episode/episode-tocs';

export const create = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_TOC,
            payload: null
        });
    }
};

export const edit = (value) => {
    return (dispatch) => {
        dispatch({
            type: EDIT_TOC,
            payload: value
        });
    }
};

export const clear = (value) => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_TOC,
            payload: value
        });
    }
};