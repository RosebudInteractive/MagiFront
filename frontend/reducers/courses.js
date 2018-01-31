import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
} from '../constants/courses'

const initialState = {
    items: [],
    fetching: false,
};

export default function courses(state = initialState, action) {

    switch (action.type) {
        case GET_COURSES_REQUEST:
            return {...state, items: [], fetching: true};

        case GET_COURSES_SUCCESS: {
            // let _list = action.payload;
            // let _selected = (_list.length > 0) ? _list[0].id : null;

            return {...state, items: action.payload, fetching: false};
        }

        case GET_COURSES_FAIL:
            return initialState;

        default:
            return state;
    }
}