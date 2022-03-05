import {
    SELECT_EPISODE_CONTENT,
    INSERT_EPISODE_CONTENT,
    UPDATE_EPISODE_CONTENT,
    REMOVE_EPISODE_CONTENT,
    MOVE_EPISODE_CONTENT_UP,
    MOVE_EPISODE_CONTENT_DOWN,
    EPISODE_CONTENT_APPLY_DATA_FROM_WORKSHOP,
} from '../../constants/episode/episode-сontents';

export const select = (id) => {
    return {
        type: SELECT_EPISODE_CONTENT,
        payload: id
    }
};

export const insert = (value) => {
    return (dispatch) => {
        dispatch({
            type: INSERT_EPISODE_CONTENT,
            payload: value
        });
    }
};

export const update = (value) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_EPISODE_CONTENT,
            payload: value
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_EPISODE_CONTENT,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_EPISODE_CONTENT_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_EPISODE_CONTENT_DOWN,
            payload: id
        });
    }
};

export const applyFromWorkShop = (data) => {
    return {
        type: EPISODE_CONTENT_APPLY_DATA_FROM_WORKSHOP,
        payload: data
    }
}