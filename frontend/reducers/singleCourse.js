import {
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
} from '../constants/courses'

const initialState = {
    object: null,
    fetching: false,
};

export default function singleCourse(state = initialState, action) {

    switch (action.type) {
        case GET_SINGLE_COURSE_REQUEST:
            return {...state, object: null, fetching: true};

        case GET_SINGLE_COURSE_SUCCESS: {
            return {...state, object: action.payload, fetching: false};
        }

        case GET_SINGLE_COURSE_FAIL:
            return initialState;

        default:
            return state;
    }
}