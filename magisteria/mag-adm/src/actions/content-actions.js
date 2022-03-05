import {
    CREATE_EPISODE_CONTENT,
    EDIT_EPISODE_CONTENT,
    CLEAR_EPISODE_CONTENT,
} from '../constants/episode/episode-сontents';

export const create = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_EPISODE_CONTENT,
            payload: null
        });
    }
};

export const edit = (value) => {
    return (dispatch) => {
        dispatch({
            type: EDIT_EPISODE_CONTENT,
            payload: value
        });
    }
};

export const clear = (value) => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_EPISODE_CONTENT,
            payload: value
        });
    }
};