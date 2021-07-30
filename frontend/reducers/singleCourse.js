import {
    GET_SINGLE_COURSE_FAIL,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    SET_COURSE_NOT_FOUND,
} from '../constants/courses'

const initialState = {
    object: null,
    fetching: false,
    notFound: false,
};

export default function singleCourse(state = initialState, action) {

    switch (action.type) {
        case GET_SINGLE_COURSE_REQUEST:
            return {...state, object: null, fetching: true, notFound: false};

        case GET_SINGLE_COURSE_SUCCESS: {
            console.log('GET_SINGLE_COURSE_SUCCESS', action.payload)
            return {...state, object: action.payload, fetching: false};
        }

        case GET_SINGLE_COURSE_FAIL:
            return initialState;

        case SET_COURSE_NOT_FOUND:
            return {...state, object: null, fetching: false, notFound: true};

        default:
            return state;
    }
}
