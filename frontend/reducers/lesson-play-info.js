import {
    GET_LESSON_PLAY_INFO_FAIL,
    GET_LESSON_PLAY_INFO_REQUEST,
    GET_LESSON_PLAY_INFO_SUCCESS,
    CLEAR_LESSON_PLAY_INFO,
    START_LESSON_PLAYING,
} from '../constants/lesson'

const initialState = {
    requestId: 0,
    playInfo: null,
    fetching: false,
};

export default function lessonPlayInfo(state = initialState, action) {

    switch (action.type) {
        case GET_LESSON_PLAY_INFO_REQUEST:
            return {...state,
                requestId: action.payload,
                playInfo: null,
                fetching: true};

        case GET_LESSON_PLAY_INFO_SUCCESS: {
            if (state.requestId === action.payload.Id) {
                return {
                    ...state,
                    playInfo: Object.assign({}, action.payload),
                    fetching: false,
                };
            } else {
                return state
            }
        }

        case GET_LESSON_PLAY_INFO_FAIL:
            return initialState;

        case START_LESSON_PLAYING:
            return {
                ...state,
                playingObject: Object.assign({}, action.payload),
                loadedObject: null,
                playing: true,
            }

        case CLEAR_LESSON_PLAY_INFO:
            return initialState;

        default:
            return state;
    }
}