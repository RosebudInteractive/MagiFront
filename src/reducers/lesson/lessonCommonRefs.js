import {
    SELECT_COMMON_REFERENCE,
    INSERT_COMMON_REFERENCE,
    UPDATE_COMMON_REFERENCE,
    REMOVE_COMMON_REFERENCE,
    MOVE_COMMON_REFERENCE_UP,
    MOVE_COMMON_REFERENCE_DOWN,
} from '../../constants/lesson/lessonCommonRefs';

import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    SAVE_LESSON_SUCCESS,
    CANCEL_CHANGE_LESSON_DATA,
    CLEAR_LESSON,
} from '../../constants/lesson/singleLesson';

import * as tools from '../tools';

const initialState = {
    initial: [],
    current: [],
    selected: null,
    hasChanges: false,
};

export default function lessonCommonRefs(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_LESSON:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,};

        case GET_SINGLE_LESSON_REQUEST:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,};

        case GET_SINGLE_LESSON_SUCCESS: {
            let _data = action.payload.commonRef;

            if (!_data) {
                return {...state, initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,}
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

        case SELECT_COMMON_REFERENCE:
            return {...state, selected: action.payload};

        case INSERT_COMMON_REFERENCE: {
            let _array = [...state.current, action.payload];
            tools.setObjectsRank(_array);

            return {...state, current: _array, selected: action.payload, hasChanges: true};
        }

        case UPDATE_COMMON_REFERENCE: {
            let _array = [];
            let _replaced = false;
            state.current.forEach((item) => {
                if (item.Id !== action.payload.Id) {
                    _array.push({...item})
                } else {
                    _array.push(action.payload);
                    _replaced = true;
                }
            });

            if (!_replaced) {
                _array.push(action.payload)
            }

            return {
                ...state,
                current: _array,
                hasChanges: true
            };
        }

        case REMOVE_COMMON_REFERENCE: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray.splice(0),
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case MOVE_COMMON_REFERENCE_UP: {
            let _result = tools.moveObjectUp(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_COMMON_REFERENCE_DOWN: {
            let _result = tools.moveObjectDown(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case CANCEL_CHANGE_LESSON_DATA: {
            return {
                ...state,
                current: [...state.initial],
                hasChanges: false,
            }
        }

        case CLEAR_LESSON:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,};

        case SAVE_LESSON_SUCCESS: {
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