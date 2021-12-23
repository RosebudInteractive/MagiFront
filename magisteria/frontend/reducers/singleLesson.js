import {
    GET_LESSON_REQUEST,
    GET_LESSON_SUCCESS,
    GET_LESSON_FAIL,
    CLEAR_LESSON,
    SET_LESSON_NOT_FOUND,
} from '../constants/lesson'

const initialState = {
    object: null,
    course:  null,
    authors: [],
    fetching: false,
    loaded: false,
    isSublesson: false,
    currentSubLesson: null,
    notFound: false,
};

export default function singleLesson(state = initialState, action) {

    switch (action.type) {
        case CLEAR_LESSON :
            return initialState

        case GET_LESSON_REQUEST:
            return {...state, object: null, fetching: true, loaded: false, isSublesson: null, notFound: false};

        case GET_LESSON_SUCCESS: {
            return {
                ...state,
                object: action.payload,
                course: action.payload.Course,
                authors: action.payload.Authors,
                isSublesson: action.payload.hasOwnProperty('SubLessonIdx'),
                currentSubLesson: action.payload.SubLessonIdx,
                fetching: false,
                loaded: true
            };
        }

        case GET_LESSON_FAIL:
            return initialState;

        case SET_LESSON_NOT_FOUND:
            return {...state, object: null, fetching: false, loaded: true, isSublesson: null, notFound: true};

        default:
            return state;
    }
}