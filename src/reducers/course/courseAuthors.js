import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    CANCEL_CHANGE_COURSE_DATA,
    CLEAR_COURSE,
    SAVE_COURSE_SUCCESS,
} from '../../constants/course/singleCourse';

import {
    ADD_AUTHOR,
    REMOVE_AUTHOR,
    SELECT_COURSE_AUTHOR,
    SHOW_ADD_AUTHOR_DIALOG,
    HIDE_ADD_AUTHOR_DIALOG,
} from '../../constants/course/courseAuthor';

import {
    GET_COURSE_AUTHORS_REQUEST,
    GET_COURSE_AUTHORS_SUCCESS,
    GET_COURSE_AUTHORS_FAIL,
} from '../../constants/course/courseAuthorsList';

import * as tools from '../tools';

const initialState = {
    initial: [],
    current: [],
    selected: null,
    hasChanges: false,
    showAddDialog: false,
    fetching: false,
};

export default function courseAuthors(state = initialState, action) {

    switch (action.type) {
        case GET_COURSE_AUTHORS_REQUEST: {
            return {...state, fetching: true};
        }

        case GET_COURSE_AUTHORS_SUCCESS:
        case GET_COURSE_AUTHORS_FAIL: {
            return {...state, fetching: false};
        }


        case CREATE_NEW_COURSE:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                showAddDialog: false,
                fetching: false,};

        case GET_SINGLE_COURSE_REQUEST:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                showAddDialog: false,};

        case GET_SINGLE_COURSE_SUCCESS: {
            let _data = action.payload.Authors;

            if (!_data) {
                return {...state, initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,
                    showAddDialog: false,
                    fetching: false,}
            } else {
                return {
                    ...state,
                    initial: [..._data],
                    current: [..._data],
                    selected: (_data.length > 0) ? _data[0] : null,
                    hasChanges: false,
                }
            }
        }

        case SELECT_COURSE_AUTHOR : {
            return {...state, selected: action.payload}
        }

        case SHOW_ADD_AUTHOR_DIALOG :
            return {...state, showAddDialog: true};

        case ADD_AUTHOR: {
            let _result = tools.addObjectRef(state.current, action.payload);

            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected,
                showAddDialog: false,
            };
        }

        case HIDE_ADD_AUTHOR_DIALOG :
            return {...state, showAddDialog: false};

        case REMOVE_AUTHOR: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case CANCEL_CHANGE_COURSE_DATA : {
            return {
                ...state,
                current: [...state.initial],
                hasChanges: false,
            }
        }

        case CLEAR_COURSE: {
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                showAddDialog: false,};
        }

        case SAVE_COURSE_SUCCESS: {
            return {
                ...state,
                initial: [...state.current],
                hasChanges: false,
            }
        }

        default:
            return state;
    }
}