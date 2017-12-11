import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
    SELECT_COURSE,
    DELETE_COURSE_SUCCESS,
    HIDE_EDIT_COURSE_DLG,
    SHOW_EDIT_COURSE_DLG,
} from '../constants/Courses'

import {
    EDIT_MODE_INSERT,
} from '../constants/Common'

const initialState = {
    courses: [],
    fetching: false,
    selected: null,
    editDlgShown: false,
    editMode: EDIT_MODE_INSERT,
    lessons: [],
};

export default function courses(state = initialState, action) {

    switch (action.type) {
        case GET_COURSES_REQUEST:
            return { ...state, courses: [], fetching: true, hasError: false };

        case GET_COURSES_SUCCESS:
            return { ...state, courses: action.payload, fetching: false };

        case GET_COURSES_FAIL:
            return { ...state, courses: [], fetching: false};

        case SELECT_COURSE: {
            let _selected = action.payload;
            let _selectedCourse = state.courses.find((elem) => {
                return elem.id === _selected
            });

            let _lessons = _selectedCourse ? _selectedCourse.Lessons : [];

            return {...state, selected: action.payload, lessons: _lessons};
        }


        case DELETE_COURSE_SUCCESS: {
            let _data = [];

            state.courses.forEach((category) => {
                if (category.id !== action.payload) {
                    _data.push({...category})
                }
            });

            return {...state, courses: _data}
        }

        case SHOW_EDIT_COURSE_DLG: {
            return {...state, editDlgShown: true, editMode: action.payload}
        }

        case HIDE_EDIT_COURSE_DLG: {
            let _data = [];
            let _replaced = false;
            state.courses.forEach((course) => {
                if (course.id !== action.payload.id) {
                    _data.push({...course})
                } else {
                    _data.push(action.payload);
                    _replaced = true;
                }
            });

            if (!_replaced) {
                _data.push(action.payload)
            }

            return {
                ...state,
                courses: _data,
                editDlgShown: false,
                selected: _replaced ? state.selected : action.payload.id
            };
        }

        default:
            return state;
    }

}