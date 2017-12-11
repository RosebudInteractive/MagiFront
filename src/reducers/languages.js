import {
    GET_LANGUAGES_REQUEST,
    GET_LANGUAGES_SUCCESS,
    GET_LANGUAGES_FAIL,

} from '../constants/Languages'

// import {
//     EDIT_MODE_INSERT,
// } from '../constants/Common'

const initialState = {
    languages: [],
    fetching: false,
    // editDlgShown: false,
    // editMode: EDIT_MODE_INSERT,
};

export default function laguages(state = initialState, action) {

    switch (action.type) {
        case GET_LANGUAGES_REQUEST:
            return { ...state, languages: [], fetching: true };

        case GET_LANGUAGES_SUCCESS:
            return { ...state, languages: action.payload, fetching: false };

        case GET_LANGUAGES_FAIL:
            return { ...state, languages: [], fetching: false};

        // case SELECT_COURSE: {
        //     let _selected = action.payload;
        //     let _selectedCourse = state.courses.find((elem) => {
        //         return elem.id === _selected
        //     });
        //
        //     let _lessons = _selectedCourse ? _selectedCourse.Lessons : [];
        //
        //     return {...state, selected: action.payload, lessons: _lessons};
        // }
        //
        //
        // case DELETE_COURSE_SUCCESS: {
        //     let _data = [];
        //
        //     state.courses.forEach((category) => {
        //         if (category.id !== action.payload) {
        //             _data.push({...category})
        //         }
        //     });
        //
        //     return {...state, courses: _data}
        // }
        //
        // case SHOW_EDIT_COURSE_DLG: {
        //     return {...state, editDlgShown: true, editMode: action.payload}
        // }
        //
        // case HIDE_EDIT_COURSE_DLG: {
        //     let _data = [];
        //     let _replaced = false;
        //     state.courses.forEach((course) => {
        //         if (course.id !== action.payload.id) {
        //             _data.push({...course})
        //         } else {
        //             _data.push(action.payload);
        //             _replaced = true;
        //         }
        //     });
        //
        //     if (!_replaced) {
        //         _data.push(action.payload)
        //     }
        //
        //     return {
        //         ...state,
        //         courses: _data,
        //         editDlgShown: false,
        //         selected: _replaced ? state.selected : action.payload.id
        //     };
        // }

        default:
            return state;
    }

}