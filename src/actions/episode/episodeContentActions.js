import {
    SELECT_EPISODE_CONTENT,
    REMOVE_EPISODE_CONTENT,
    MOVE_EPISODE_CONTENT_UP,
    MOVE_EPISODE_CONTENT_DOWN,
} from '../../constants/episode/episodeContent';

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_EPISODE_CONTENT,
            payload: id
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