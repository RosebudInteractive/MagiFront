import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    CANCEL_CHANGE_COURSE_DATA,
    CLEAR_COURSE,
    SAVE_COURSE_DATA,
} from '../../constants/course/singleCourse';

import {
    ADD_CATEGORY,
    REMOVE_CATEGORY,
    SELECT_COURSE_CATEGORY,
    SHOW_ADD_CATEGORY_DIALOG,
    HIDE_ADD_CATEGORY_DIALOG,
} from '../../constants/course/courseCategory';

import * as tools from '../tools';

const initialState = {
    initial: [],
    current: [],
    selected: null,
    hasChanges: false,
    showAddDialog: false,
};

export default function courseCategories(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_COURSE:
            return {
                ...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                showAddDialog: false,
            };

        case GET_SINGLE_COURSE_REQUEST:
            return {
                ...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                showAddDialog: false,
            };

        case GET_SINGLE_COURSE_SUCCESS: {
            let _data = action.payload.Categories;

            if (!_data) {
                return {
                    ...state, initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,
                    showAddDialog: false,
                };
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

        case SELECT_COURSE_CATEGORY : {
            return {...state, selected: action.payload}
        }

        case REMOVE_CATEGORY: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case ADD_CATEGORY: {
            let _result = tools.addObjectRef(state.current, action.payload);

            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected,
                showAddDialog: false,
            }
        }

        case SHOW_ADD_CATEGORY_DIALOG: {
            return {...state, showAddDialog: true};
        }

        case HIDE_ADD_CATEGORY_DIALOG : {
            return {...state, showAddDialog: false};
        }

        case CANCEL_CHANGE_COURSE_DATA : {
            return {
                ...state,
                current: [...state.initial],
                hasChanges: false,
            }
        }

        case CLEAR_COURSE: {
            return {
                ...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                showAddDialog: false,
            };
        }

        case SAVE_COURSE_DATA: {
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