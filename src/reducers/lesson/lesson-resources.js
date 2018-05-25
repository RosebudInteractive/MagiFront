import {
    SELECT_RESOURCE,
    INSERT_RESOURCE,
    UPDATE_RESOURCE,
    REMOVE_RESOURCE,
    MOVE_RESOURCE_UP,
    MOVE_RESOURCE_DOWN,
} from '../../constants/lesson/lessonResources';

import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,
    SAVE_LESSON_SUCCESS,
    CANCEL_CHANGE_LESSON_DATA,
    CLEAR_LESSON,
    GET_LESSON_RESOURCES_REQUEST,
    GET_LESSON_RESOURCES_FAIL,
    GET_LESSON_RESOURCES_SUCCESS,
} from '../../constants/lesson/singleLesson';

import * as tools from '../tools';

const initialState = {
    initial: [],
    current: [],
    selected: null,
    hasChanges: false,
    loaded: false,
    fetching: false,
};

export default function lessonResources(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_LESSON:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                loaded: false,
                fetching: false,};

        case GET_SINGLE_LESSON_REQUEST:
            return {
                ...state,
                initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                loaded: false,
                fetching: true,
            };

        case GET_LESSON_RESOURCES_REQUEST:
            return {
                ...state,
                initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                loaded: false,
                fetching: true,
            };

        case GET_SINGLE_LESSON_SUCCESS: {
            let _data = action.payload.Resources;

            if (!_data) {
                return {...state, initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,
                    loaded: false,
                    fetching: false,}
            } else {
                return {
                    ...state,
                    initial: [..._data],
                    current: [..._data],
                    selected: (_data.length > 0) ? _data[0].id : null,
                    hasChanges: false,
                    loaded: true,
                    fetching: false,
                }
            }

        }

        case GET_LESSON_RESOURCES_SUCCESS: {
            let _data = action.payload;

            if (!_data) {
                return {...state, initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,
                    loaded: false,
                    fetching: false,}
            } else {
                return {
                    ...state,
                    initial: [..._data],
                    current: [..._data],
                    selected: (_data.length > 0) ? _data[0].id : null,
                    hasChanges: false,
                    loaded: true,
                    fetching: false,
                }
            }

        }

        case GET_SINGLE_LESSON_FAIL:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                loaded: false,
                fetching: false,};

        case GET_LESSON_RESOURCES_FAIL:
            return {...state, initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                loaded: false,
                fetching: false,};

        case SELECT_RESOURCE:
            return {...state, selected: action.payload};

        case INSERT_RESOURCE: {
            let _array = [...state.current, action.payload];
            tools.setObjectsRank(_array);

            return {...state, current: _array, hasChanges: true};
        }

        case UPDATE_RESOURCE: {
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

        case REMOVE_RESOURCE: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case MOVE_RESOURCE_UP: {
            let _result = tools.moveObjectUp(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_RESOURCE_DOWN: {
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
            return initialState;

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