import {
    GET_LESSON_PLAY_INFO_FAIL,
    GET_LESSON_PLAY_INFO_REQUEST,
    GET_LESSON_PLAY_INFO_SUCCESS,
    CLEAR_LESSON_PLAY_INFO,
    START_LESSON_PLAYING,
} from '../constants/lesson'

const initialState = {
    loadedObject: null,
    playingObject: null,
    fetching: false,
    loaded: false,
    playing: false,
};

export default function lessonPlayInfo(state = initialState, action) {

    switch (action.type) {
        case GET_LESSON_PLAY_INFO_REQUEST:
            return {...state, loadedObject: null, playingObject: null, fetching: true, loaded: false, playing: false};

        case GET_LESSON_PLAY_INFO_SUCCESS: {
            return {
                ...state,
                loadedObject: action.payload,
                fetching: false,
                loaded: true,
                playing: false,
            };
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