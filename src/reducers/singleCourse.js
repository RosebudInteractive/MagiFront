import {
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    SHOW_ADD_AUTHOR_DIALOG,
    ADD_AUTHOR,
    REMOVE_AUTHOR,
    HIDE_ADD_AUTHOR_DIALOG,
    ADD_CATEGORY,
    REMOVE_CATEGORY,

} from '../constants/SingleCourse'

// import {
//     EDIT_MODE_INSERT,
// } from '../constants/Common'

const initialState = {
    course: null,
    authors: [],
    categories: [],
    fetching: false,
    // editDlgShown: false,
    // editMode: EDIT_MODE_INSERT,
    showAddAuthorDialog : false,
};

export default function singleCourse(state = initialState, action) {

    switch (action.type) {
        case GET_SINGLE_COURSE_REQUEST:
            return { ...state, course: null, authors: [], fetching: true };

        case GET_SINGLE_COURSE_SUCCESS:
            return { ...state, course: action.payload, authors: action.payload.Authors, fetching: false };

        case GET_SINGLE_COURSE_FAIL:
            return { ...state, course: null, fetching: false};

        case SHOW_ADD_AUTHOR_DIALOG :
            return { ...state, showAddAuthorDialog: true};

        case ADD_AUTHOR: {
            let _authorId = action.payload;
            if (!state.course.Authors.includes(_authorId)) {
                state.course.Authors.push(_authorId)
            }

            return {...state, course: state.course, showAddAuthorDialog : false,};
        }

        case REMOVE_AUTHOR: {
            let _authorId = action.payload;
            let _index = state.course.Authors.indexOf(_authorId);
            if (_index > -1) {
                state.course.Authors.splice(_index, 1);
            }

            return {...state, authors: state.course.Authors}
        }

        case HIDE_ADD_AUTHOR_DIALOG :
            return { ...state, showAddAuthorDialog: false};

        case ADD_CATEGORY: {
            let _categoryId = action.payload;
            if (!state.course.Categories.includes(_categoryId)) {
                state.course.Categories.push(_categoryId)
            }

            return {...state, course: state.course};
        }

        case REMOVE_CATEGORY: {
            let _categoryId = action.payload;
            let _index = state.course.Categories.indexOf(_categoryId);
            if (_index > -1) {
                state.course.Categories.splice(_index, 1);
            }

            return {...state, course: state.course}
        }
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