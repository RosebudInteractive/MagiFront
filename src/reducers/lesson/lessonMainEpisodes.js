import {
    SELECT_MAIN_EPISODE,
    REMOVE_MAIN_EPISODE,
    MOVE_MAIN_EPISODE_UP,
    MOVE_MAIN_EPISODE_DOWN,
} from '../../constants/lesson/lessonMainEpisodes';

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
            return initialState;

        case GET_SINGLE_LESSON_REQUEST:
            return initialState;

        case GET_SINGLE_LESSON_SUCCESS: {
            let _data = action.payload.mainEpisodes;

            if (!_data) {
                return initialState
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

        case SELECT_MAIN_EPISODE:
            return {...state, selected: action.payload};

        case REMOVE_MAIN_EPISODE: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case MOVE_MAIN_EPISODE_UP: {
            let _result = tools.moveObjectUp(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_MAIN_EPISODE_DOWN: {
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