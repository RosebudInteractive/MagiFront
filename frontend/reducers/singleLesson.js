import {
    GET_LESSON_REQUEST,
    GET_LESSON_SUCCESS,
    GET_LESSON_FAIL,
} from '../constants/lesson'

const initialState = {
    object: null,
    course:  null,
    authors: [],
    fetching: false,
    loaded: false,
};

export default function singleLesson(state = initialState, action) {

    switch (action.type) {
        case GET_LESSON_REQUEST:
            return {...state, object: null, fetching: true, loaded: false};

        case GET_LESSON_SUCCESS: {
            return {
                ...state,
                object: action.payload.Lesson,
                course: action.payload.Course,
                authors: action.payload.Authors,
                fetching: false,
                loaded: true
            };
        }

        case GET_LESSON_FAIL:
            return initialState;

        default:
            return state;
    }
}