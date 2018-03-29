import {
    PLAYER_START_PLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP,
    PLAYER_START_SET_CURRENT_TIME,
} from '../constants/player'

export const startPlay = () => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_START_PLAY,
            payload: null
        });
    }
};


export const startPause = () => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_START_PAUSE,
            payload: null
        });
    }
};

export const startStop = () => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_START_STOP,
            payload: null
        });
    }
};

export const startSetCurrentTime = (time) => {
    return (dispatch) => {
        dispatch({
            type: PLAYER_START_SET_CURRENT_TIME,
            payload: time
        });
    }
}