import {
    PLAYER_START_PLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP,
    PLAYER_START_SET_CURRENT_TIME,
    PLAYER_TOGGLE_MUTE,
    PLAYER_START_SET_VOLUME,
    PLAYER_START_SET_RATE,
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
    return {
        type: PLAYER_START_SET_CURRENT_TIME,
        payload: time
    }
}

export const toggleMute = () => {
    return {
        type: PLAYER_TOGGLE_MUTE,
        payload: null
    }
}

export const startSetVolume = (value) => {
    return {
        type: PLAYER_START_SET_VOLUME,
        payload: value
    };
}

export const startSetRate = (value) => {
    return {
        type: PLAYER_START_SET_RATE,
        payload: value
    };
}