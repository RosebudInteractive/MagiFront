import {
    GET_LESSONS_ALL_REQUEST,
    GET_LESSONS_ALL_SUCCESS,
    GET_LESSONS_ALL_FAIL,
} from '../constants/lesson'

const initialState = {
    object: [],
    current: null,
    authors: [],
    fetching: false,
    loaded: false,
};

export default function lessons(state = initialState, action) {

    switch (action.type) {
        case GET_LESSONS_ALL_REQUEST:
            return {...state, object: [], fetching: true, loaded: false};

        case GET_LESSONS_ALL_SUCCESS: {
            return {...state,
                object: action.payload.Lessons,
                current: action.payload.CurrLesson[0],
                authors: action.payload.Authors,
                fetching: false,
                loaded: true
            };
        }

        case GET_LESSONS_ALL_FAIL:
            return initialState;

        default:
            return state;
    }
}