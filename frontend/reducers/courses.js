import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
} from '../constants/courses'

const initialState = {
    items: [],
    fetching: false,
    loaded: false,
};

export default function courses(state = initialState, action) {

    switch (action.type) {
        case GET_COURSES_REQUEST:
            return {...state, items: [], fetching: true, loaded: false};

        case GET_COURSES_SUCCESS: {
            return {...state, items: action.payload.Courses, fetching: false, loaded: true};
        }

        case GET_COURSES_FAIL:
            return initialState;

        default:
            return state;
    }
}