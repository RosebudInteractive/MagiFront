import {
    GET_LESSON_TEXT_REQUEST,
    GET_LESSON_TEXT_SUCCESS,
    GET_LESSON_TEXT_FAIL,
    SET_LESSON_TEXT_NOT_FOUND,
} from '../constants/lesson'

const initialState = {
    episodes: null,
    books: null,
    gallery: null,
    refs: null,
    fetching: false,
    loaded: false,
    notFound: false,
};

export default function singleLesson(state = initialState, action) {

    switch (action.type) {
        case GET_LESSON_TEXT_REQUEST:
            return {...state, object: null, fetching: true, loaded: false, notFound: false};

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

        case SET_LESSON_TEXT_NOT_FOUND:
            return {...state, object: null, fetching: false, loaded: false, notFound: true};

        default:
            return state;
    }
}