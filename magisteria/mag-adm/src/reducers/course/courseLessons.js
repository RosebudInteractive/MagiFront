import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    CANCEL_CHANGE_COURSE_DATA,
    CLEAR_COURSE,
    SAVE_COURSE_SUCCESS,
} from '../../constants/course/singleCourse';

import {
    REMOVE_LESSON,
    SELECT_COURSE_LESSON,
    MOVE_LESSON_UP,
    MOVE_LESSON_DOWN,
} from '../../constants/course/courseLessons'

import * as tools from '../tools';

const initialState = {
    initial: [],
    current: [],
    selected: null,
    hasChanges: false,
};

export default function courseLessons(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_COURSE:
            return {
                ...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
            };

        case GET_SINGLE_COURSE_REQUEST:
            return {
                ...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
            };

        case GET_SINGLE_COURSE_SUCCESS: {
            let _data = action.payload.Lessons;

            if (!_data) {
                return {
                    ...state, initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,
                };
            } else {
                return {
                    ...state,
                    initial: [..._data],
                    current: [..._data],
                    selected: (_data.length > 0) ? _data[0].id : null,
                    hasChanges: false,
                }
            }
        }

        case SELECT_COURSE_LESSON : {
            return {...state, selected: action.payload}
        }

        case REMOVE_LESSON: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case  MOVE_LESSON_UP : {
            let _result = tools.moveObjectUp(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_LESSON_DOWN : {
            let _result = tools.moveObjectDown(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
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
            };
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