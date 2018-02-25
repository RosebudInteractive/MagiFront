import {
    GET_LESSON_TEXT_REQUEST,
    GET_LESSON_TEXT_SUCCESS,
    GET_LESSON_TEXT_FAIL,
} from '../constants/lesson'

const initialState = {
    episodes: null,
    books:  null,
    gallery: null,
    refs: null,
    fetching: false,
    loaded: false,
};

export default function singleLesson(state = initialState, action) {

    switch (action.type) {
        case GET_LESSON_TEXT_REQUEST:
            return {...state, object: null, fetching: true, loaded: false};

        case GET_LESSON_TEXT_SUCCESS: {
            return {
                ...state,
                episodes: action.payload.Episodes,
                books: action.payload.Books,
                gallery: action.payload.Galery,
                refs: action.payload.Refs,
                fetching: false,
                loaded: true
            };
        }

        case GET_LESSON_TEXT_FAIL:
            return initialState;

        default:
            return state;
    }
}