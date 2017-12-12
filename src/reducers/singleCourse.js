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
    CHANGE_DATA,
    CANCEL_CHANGE_DATA,
    REMOVE_LESSON,
    MOVE_LESSON_UP,
    MOVE_LESSON_DOWN,

} from '../constants/SingleCourse'

// import {
//     EDIT_MODE_INSERT,
// } from '../constants/Common'

const initialState = {
    initialCourse: null,
    course: null,
    authors: [],
    categories: [],
    lessons: [],
    fetching: false,
    // editDlgShown: false,
    // editMode: EDIT_MODE_INSERT,
    showAddAuthorDialog: false,
    showAddCategoryDialog: false,
    hasChanges : false,
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
                initialCourse: _course,
                course: Object.assign({}, _course),
                authors: [],
                categories:[],
                lessons: [],
                fetching: false,
                hasChanges : false,
            };
        }

        case GET_SINGLE_COURSE_REQUEST:
            return {
                ...state,
                initialCourse : null,
                course: null,
                authors: [],
                categories:[],
                lessons: [],
                fetching: true,
                hasChanges : false,
            };

        case GET_SINGLE_COURSE_SUCCESS:
            return {
                ...state,
                initialCourse: action.payload,
                course: Object.assign({}, action.payload),
                authors: [...action.payload.Authors],
                categories: [...action.payload.Categories],
                lessons: [...action.payload.Lessons],
                fetching: false,
                hasChanges : false,
            };

        case GET_SINGLE_COURSE_FAIL:
            return {
                ...state,
                initialCourse:null,
                course: null,
                authors: [],
                categories:[],
                lessons: [],
                fetching: false,
                hasChanges : false,
            };

        case SHOW_ADD_AUTHOR_DIALOG :
            return { ...state, showAddAuthorDialog: true};

        case ADD_AUTHOR: {
            let _authors = [];
            let _modified = false;

            let _authorId = action.payload;
            if (!state.authors.includes(_authorId)) {
                _modified = true;
                state.authors.push(_authorId)
            }

            _authors.push(...state.authors);

            return {...state, authors: _authors, showAddAuthorDialog : false, hasChanges: _modified ? true : state.hasChanges};
        }

        case REMOVE_AUTHOR: {
            let _authors = [];
            let _modified = false;

            let _authorId = action.payload;
            let _index = state.authors.indexOf(_authorId);
            if (_index > -1) {
                _modified = true;
                state.authors.splice(_index, 1);
            }

            _authors.push(...state.authors);

            return {...state, authors: _authors, hasChanges: _modified ? true : state.hasChanges};
        }

        case HIDE_ADD_AUTHOR_DIALOG :
            return { ...state, showAddAuthorDialog: false};

        case SHOW_ADD_CATEGORY_DIALOG :
            return { ...state, showAddCategoryDialog: true};

        case ADD_CATEGORY: {
            let _categories = [];
            let _modified = false;
            let _categoryId = action.payload;
            if (!state.categories.includes(_categoryId)) {
                _modified = true;
                state.categories.push(_categoryId)
            }

            _categories.push(...state.categories);

            return {...state, categories: _categories, showAddCategoryDialog: false, hasChanges: _modified ? true : state.hasChanges};
        }

        case REMOVE_CATEGORY: {
            let _categories = [];
            let _modified = false;

            let _categoryId = action.payload;
            let _index = state.categories.indexOf(_categoryId);
            if (_index > -1) {
                _modified = true;
                state.categories.splice(_index, 1);
            }

            _categories.push(...state.categories);

            return {...state, categories: _categories, hasChanges: _modified ? true : state.hasChanges};
        }

        case HIDE_ADD_CATEGORY_DIALOG :
            return { ...state, showAddCategoryDialog: false};

        case CHANGE_DATA : {
            let _course = Object.assign({}, action.payload);

            return {...state, course: _course, hasChanges: true };
        }

        case CANCEL_CHANGE_DATA: {
            return {
                ...state,
                course: Object.assign({},state.initialCourse),
                authors: [...state.initialCourse.Authors],
                categories: [...state.initialCourse.Categories],
                lessons: [...state.initialCourse.Lessons],
                hasChanges : false,
            };
        }

        case REMOVE_LESSON: {
            let _lessons = [];
            let _modified = false;

            let _lessonId = action.payload;
            let _index = state.lessons.findIndex((lesson) => {return lesson.id === _lessonId});
            if (_index > -1) {
                _modified = true;
                state.lessons.splice(_index, 1);
            }

            _lessons.push(...state.lessons);

            return {...state, lessons: _lessons, hasChanges: _modified ? true : state.hasChanges};
        }

        case MOVE_LESSON_UP: {
            let _lessons = [];
            let _modified = false;

            let _lessonId = action.payload;
            let _index = state.lessons.findIndex((lesson) => {return lesson.id === _lessonId});
            if (_index > 0) {
                let _deleted = state.lessons.splice(_index - 1, 1);
                state.lessons.splice(_index, 0, _deleted[0]);
                _modified = true;
            }

            if (_modified) {
                state.lessons.forEach((lesson, index) => {
                    lesson.Number = index +1
                })
            }

            _lessons.push(...state.lessons);

            return {...state, lessons: _lessons, hasChanges: _modified ? true : state.hasChanges};
        }

        case MOVE_LESSON_DOWN: {
            let _lessons = [];
            let _modified = false;

            let _lessonId = action.payload;
            let _index = state.lessons.findIndex((lesson) => {
                return lesson.id === _lessonId
            });
            if (_index < state.lessons.length - 1) {
                let _deleted = state.lessons.splice(_index, 1);
                state.lessons.splice(_index + 1, 0, _deleted[0]);
                _modified = true;
            }

            if (_modified) {
                state.lessons.forEach((lesson, index) => {
                    lesson.Number = index + 1
                })
            }

            _lessons.push(...state.lessons);

            return {...state, lessons: _lessons, hasChanges: _modified ? true : state.hasChanges};
        }

        default:
            return state;
    }

}