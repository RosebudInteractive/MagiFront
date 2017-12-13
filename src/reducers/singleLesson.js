import {
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,
} from '../constants/SingleLesson'

const initialState = {
    initialLesson: null,
    lesson: null,
    fetching: false,
    hasChanges : false,
};

export default function courseAuthors(state = initialState, action) {

    switch (action.type) {
        case GET_SINGLE_LESSON_REQUEST:
            return {
                ...state,
                initialLesson : null,
                lesson: null,
                fetching: true,
                hasChanges : false,
            };

        case GET_SINGLE_LESSON_SUCCESS:
            return {
                ...state,
                initialLesson: action.payload,
                lesson: Object.assign({}, action.payload),
                fetching: false,
                hasChanges : false,
            };

        case GET_SINGLE_LESSON_FAIL:
            return {
                ...state,
                initialLesson : null,
                lesson: null,
                fetching: true,
                hasChanges : false,
            };

        default:
            return state;
    }

}