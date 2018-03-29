import {
    PLAYER_PLAYED,
    PLAYER_PAUSED,
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_TITLE,
} from '../constants/player'

export const play = () => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_PLAYED,
            payload: null
        });
    }
};


export const pause = () => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_PAUSED,
            payload: null
        });
    }
};

export const setCurrentTime = (time) => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_SET_CURRENT_TIME,
            payload: time
        });
    }
};

export const setTitle = (title) => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_SET_TITLE,
            payload: title
        });
    }
};