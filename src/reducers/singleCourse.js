import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    SHOW_ADD_AUTHOR_DIALOG,
    ADD_AUTHOR,
    REMOVE_AUTHOR,
    HIDE_ADD_AUTHOR_DIALOG,
    SHOW_ADD_CATEGORY_DIALOG,
    ADD_CATEGORY,
    REMOVE_CATEGORY,
    HIDE_ADD_CATEGORY_DIALOG,

} from '../constants/SingleCourse'

// import {
//     EDIT_MODE_INSERT,
// } from '../constants/Common'

const initialState = {
    course: null,
    authors: [],
    categories: [],
    lessons: [],
    fetching: false,
    // editDlgShown: false,
    // editMode: EDIT_MODE_INSERT,
    showAddAuthorDialog: false,
    showAddCategoryDialog: false,
};

export default function singleCourse(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_COURSE: {
            let _course = {
                ColorHex: '#FFFFFF',
                State:'D',
                Authors:[],
                Categories:[],
                Lessons:[],
            };

            return {
                ...state,
                course: _course,
                authors: [],
                categories:[],
                lessons: [],
                fetching: false };
        }

        case GET_SINGLE_COURSE_REQUEST:
            return {
                ...state,
                course: null,
                authors: [],
                categories:[],
                lessons: [],
                fetching: true
            };

        case GET_SINGLE_COURSE_SUCCESS:
            return {
                ...state,
                course: action.payload,
                authors: action.payload.Authors,
                categories: action.payload.Categories,
                lessons: action.payload.Lessons,
                fetching: false
            };

        case GET_SINGLE_COURSE_FAIL:
            return {
                ...state,
                course: null,
                authors: [],
                categories:[],
                lessons: [],
                fetching: false
            };

        case SHOW_ADD_AUTHOR_DIALOG :
            return { ...state, showAddAuthorDialog: true};

        case ADD_AUTHOR: {
            let _authors = [];
            let _authorId = action.payload;
            if (!state.course.Authors.includes(_authorId)) {
                state.course.Authors.push(_authorId)
            }

            _authors.push(...state.course.Authors);

            return {...state, authors: _authors, showAddAuthorDialog : false,};
        }

        case REMOVE_AUTHOR: {
            let _authors = [];
            let _authorId = action.payload;
            let _index = state.course.Authors.indexOf(_authorId);
            if (_index > -1) {
                state.course.Authors.splice(_index, 1);
            }

            _authors.push(...state.course.Authors);

            return {...state, authors: _authors}
        }

        case HIDE_ADD_AUTHOR_DIALOG :
            return { ...state, showAddAuthorDialog: false};

        case SHOW_ADD_CATEGORY_DIALOG :
            return { ...state, showAddCategoryDialog: true};

        case ADD_CATEGORY: {
            let _categories = [];
            let _categoryId = action.payload;
            if (!state.course.Categories.includes(_categoryId)) {
                state.course.Categories.push(_categoryId)
            }

            _categories.push(...state.course.Categories);

            return {...state, categories: _categories};
        }

        case REMOVE_CATEGORY: {
            let _categories = [];

            let _categoryId = action.payload;
            let _index = state.course.Categories.indexOf(_categoryId);
            if (_index > -1) {
                state.course.Categories.splice(_index, 1);
            }

            _categories.push(...state.course.Categories);

            return {...state, categories: _categories}
        }

        case HIDE_ADD_CATEGORY_DIALOG :
            return { ...state, showAddCategoryDialog: false};
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