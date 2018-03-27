import {
    GET_COURSE_AUTHORS_REQUEST,
    GET_COURSE_AUTHORS_SUCCESS,
    GET_COURSE_AUTHORS_FAIL,
} from '../../constants/course/courseAuthorsList'

const initialState = {
    authors: [],
    fetching: false,
    selected: null,
};

export default function courseAuthors(state = initialState, action) {

    switch (action.type) {
        case GET_COURSE_AUTHORS_REQUEST:
            return {...state, authors: [], fetching: true};

        case GET_COURSE_AUTHORS_SUCCESS:
            return {...state, authors: action.payload, fetching: false};

        case GET_COURSE_AUTHORS_FAIL:
            return {...state, authors: [], fetching: false};

        default:
            return state;
    }
}