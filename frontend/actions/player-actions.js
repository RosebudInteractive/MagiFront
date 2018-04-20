import {
    PLAYER_PLAYED,
    PLAYER_PAUSED,
    PLAYER_STOPPED,
    PLAYER_ENDED,
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_TITLE,
    PLAYER_SET_MUTE_STATE,
    PLAYER_SET_VOLUME,
    PLAYER_SET_CONTENT_ARRAY,
    PLAYER_SET_CURRENT_CONTENT,
    PLAYER_SET_RATE,
    PLAYER_SET_SMALL_VIEWPORT,
    PLAYER_SET_FULL_VIEWPORT,
    PLAYER_CLEAR_FULL_VIEWPORT,
    PLAYER_SET_BUFFERED_TIME,
} from '../constants/player'

export const play = () => {
    return {
        type: PLAYER_PLAYED,
        payload: null
    }
};

export const pause = () => {
    return {
        type: PLAYER_PAUSED,
        payload: null
    };
};

export const stop = () => {
    return {
        type: PLAYER_STOPPED,
        payload: null
    }
};

export const end = () => {
    return {
        type: PLAYER_ENDED,
        payload: null
    }
}

export const setCurrentTime = (time) => {
    return {
        type: PLAYER_SET_CURRENT_TIME,
        payload: time
    };
};

export const setTitle = (value) => {
    return {
        type: PLAYER_SET_TITLE,
        payload: value
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

export const clearFullViewPort = (div) => {
    return {
        type: PLAYER_CLEAR_FULL_VIEWPORT,
        payload: div
    }
}

export const setBufferedTime = (value) => {
    return {
        type: PLAYER_SET_BUFFERED_TIME,
        payload: value
    }
}