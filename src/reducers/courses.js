import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
    SELECT_COURSE,
    DELETE_COURSE_SUCCESS,
} from '../constants/Courses'

import {
    EDIT_MODE_INSERT,
} from '../constants/Common'

import * as tools from './tools';

const initialState = {
    items: [],
    fetching: false,
    selected: null,
    editDlgShown: false,
    editMode: EDIT_MODE_INSERT,
    lessons: [],
};

export default function courses(state = initialState, action) {

    switch (action.type) {
        case GET_COURSES_REQUEST:
            return { ...state, items: [], fetching: true, hasError: false };

        case GET_COURSES_SUCCESS: {
            let _list = action.payload;
            let _selected = (_list.length > 0) ? _list[0].id : null;

            return { ...state, items: action.payload, selected: _selected, fetching: false };
        }

        case GET_COURSES_FAIL:
            return initialState;

        case SELECT_COURSE: {
            let _selected = action.payload;
            let _selectedCourse = state.items.find((elem) => {
                return elem.id === _selected
            });

            let _lessons = _selectedCourse ? _selectedCourse.Lessons : [];

            return {...state, selected: action.payload, lessons: _lessons};
        }

        case DELETE_COURSE_SUCCESS: {
            let _result = tools.deleteObject(state.items, action.payload);

            return {...state, items: _result.resultArray, selected : _result.selected};
        }

        default:
            return state;
    }

}