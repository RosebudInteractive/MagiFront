import {
    PLAYER_START_PLAY_LESSON,
    PLAYER_START_PLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP,
    PLAYER_START_SET_CURRENT_TIME,
    PLAYER_TOGGLE_MUTE,
    PLAYER_START_SET_VOLUME,
    PLAYER_START_SET_RATE,
    PLAYER_PREINIT_AUDIOS,
    PLAYER_START_REPLAY,
    PLAYER_CLEAR_AUDIOS,
    PLAYER_CANCEL_START,
} from '../constants/player'

export const startPlayLesson = (lesson) => {
    return {
        type: PLAYER_START_PLAY_LESSON,
        payload: lesson
    }
};

export const cancelStarting = (lessonId) => {
    return {
        type: PLAYER_CANCEL_START,
        payload: lessonId
    }
};


// type PlayData = {
//   lessonId: number;
// }
export const startPlay = (playData) => {
    return {
        type: PLAYER_START_PLAY,
        payload: playData
    };
};

export const startReplay = (lessonId) => {
    return {
        type: PLAYER_START_REPLAY,
        payload: lessonId
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
    return {
        type: PLAYER_START_STOP,
        payload: null
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

export const preinitAudios = (value) => {
    return {
        type: PLAYER_PREINIT_AUDIOS,
        payload: value
    };
}

export const clearAudios = (value) => {
    return {
        type: PLAYER_CLEAR_AUDIOS,
        payload: value
    };
}