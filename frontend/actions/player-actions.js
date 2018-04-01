import {
    PLAYER_PLAYED,
    PLAYER_PAUSED,
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_TITLE,
    PLAYER_SET_MUTE_STATE,
    PLAYER_SET_VOLUME,
    PLAYER_SET_CONTENT_ARRAY,
    PLAYER_SET_CURRENT_CONTENT,
    PLAYER_SET_RATE,
    PLAYER_SET_SMALL_VIEWPORT,
    PLAYER_SET_FULL_VIEWPORT,
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
    return {
        type: PLAYER_SET_CURRENT_TIME,
        payload: time
    };
};

export const setTitle = (title) => {
    return {
        type: PLAYER_SET_TITLE,
        payload: title
    };
};

export const setMuteState = (value) => {
    return {
        type: PLAYER_SET_MUTE_STATE,
        payload: value
    }
};

export const setVolume = (value) => {
    return {
        type: PLAYER_SET_VOLUME,
        payload: value
    }
};

export const setContentArray = (value) => {
    return {
        type: PLAYER_SET_CONTENT_ARRAY,
        payload: value
    }
}

export const setCurrentContent = (value) => {
    return {
        type: PLAYER_SET_CURRENT_CONTENT,
        payload: value
    }
};

export const setRate = (value) => {
    return {
        type: PLAYER_SET_RATE,
        payload: value
    }
};

export const setSmallViewPort = (div) => {
    return {
        type: PLAYER_SET_SMALL_VIEWPORT,
        payload: div
    }
}

export const setFullViewPort = (div) => {
    return {
        type: PLAYER_SET_FULL_VIEWPORT,
        payload: div
    }
}