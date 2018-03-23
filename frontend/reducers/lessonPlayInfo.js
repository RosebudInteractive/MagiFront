import {
    GET_LESSON_PLAY_INFO_FAIL,
    GET_LESSON_PLAY_INFO_REQUEST,
    GET_LESSON_PLAY_INFO_SUCCESS,
    CLEAR_LESSON_PLAY_INFO,
} from '../constants/lesson'

const initialState = {
    object: null,
    fetching: false,
    loaded: false,
};

export default function lessonPlayInfo(state = initialState, action) {

    switch (action.type) {
        case GET_LESSON_PLAY_INFO_REQUEST:
            return {...state, object: null, fetching: true, loaded: false};

        case GET_LESSON_PLAY_INFO_SUCCESS: {
            return {
                ...state,
                object: action.payload,
                fetching: false,
                loaded: true
            };
        }

        case GET_LESSON_PLAY_INFO_FAIL:
            return initialState;

        case CLEAR_LESSON_PLAY_INFO:
            return initialState;

        default:
            return state;
    }
}