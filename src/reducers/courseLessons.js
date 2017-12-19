import {
    SELECT_COURSE_LESSON,

} from '../constants/SingleCourse'

const initialState = {
    // authors: [],
    // fetching: false,
    selected: null,
};

export default function courseLessons(state = initialState, action) {

    switch (action.type) {
        // case GET_COURSE_AUTHORS_REQUEST:
        //     return { ...state, authors: [], fetching: true};
        //
        // case GET_COURSE_AUTHORS_SUCCESS:
        //     return { ...state, authors: action.payload, fetching: false };
        //
        // case GET_COURSE_AUTHORS_FAIL:
        //     return { ...state, authors: [], fetching: false};

        case SELECT_COURSE_LESSON : {
            return { ...state, selected: action.payload}
        }

        default:
            return state;
    }
}