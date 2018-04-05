import {
    SELECT_MAIN_EPISODE,
    REMOVE_MAIN_EPISODE,
    MOVE_MAIN_EPISODE_UP,
    MOVE_MAIN_EPISODE_DOWN,
} from '../../constants/lesson/lessonMainEpisodes';

export const select = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_MAIN_EPISODE,
            payload: id
        });
    }
};

export const remove = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_MAIN_EPISODE,
            payload: id
        });
    }
};

export const moveUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_MAIN_EPISODE_UP,
            payload: id
        });
    }
};

export const moveDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_MAIN_EPISODE_DOWN,
            payload: id
        });
    }
};
