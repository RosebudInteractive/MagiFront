import {
    SELECT_EPISODE_CONTENT,
    INSERT_EPISODE_CONTENT,
    UPDATE_EPISODE_CONTENT,
    REMOVE_EPISODE_CONTENT,
    MOVE_EPISODE_CONTENT_UP,
    MOVE_EPISODE_CONTENT_DOWN, EPISODE_CONTENT_APPLY_DATA_FROM_WORKSHOP,
} from '../../constants/episode/episode-сontents';

import {
    CREATE_NEW_EPISODE,
    GET_SINGLE_EPISODE_REQUEST,
    GET_SINGLE_EPISODE_SUCCESS,
    SAVE_EPISODE_SUCCESS,
    CANCEL_CHANGE_EPISODE_DATA,
    CLEAR_EPISODE,
} from '../../constants/episode/singleEpisode';

import * as tools from '../tools';

const initialState = {
    initial: [],
    current: [],
    selected: null,
    hasChanges: false,
    fetching: false,
};

export default function episodeContent(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_EPISODE:
            return {
                ...state,
                initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                fetching: false,

            };

        case GET_SINGLE_EPISODE_REQUEST:
            return {
                ...state,
                initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                fetching: true,
            };

        case GET_SINGLE_EPISODE_SUCCESS: {
            let _data = action.payload.Content;

            if (!_data) {
                return {
                    ...state,
                    initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,
                    fetching: false,
                }
            } else {
                return {
                    ...state,
                    initial: [..._data],
                    current: [..._data],
                    selected: (_data.length > 0) ? _data[0].id : null,
                    hasChanges: false,
                    fetching: false,
                }
            }
        }

        case EPISODE_CONTENT_APPLY_DATA_FROM_WORKSHOP : {
            return {
                ...state,
                hasChanges: true, //Object.is(state.current, action.payload),
                current: [...action.payload],
                selected: (action.payload.length > 0) ? action.payload[0].id : null,
            }
        }

        case SELECT_EPISODE_CONTENT:
            return {...state, selected: action.payload};

        case INSERT_EPISODE_CONTENT: {
            let _array = [...state.current, action.payload];
            tools.setObjectsRank(_array);

            return {...state, current: _array, hasChanges: true};
        }

        case UPDATE_EPISODE_CONTENT: {
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

        case REMOVE_EPISODE_CONTENT: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case MOVE_EPISODE_CONTENT_UP: {
            let _result = tools.moveObjectUp(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_EPISODE_CONTENT_DOWN: {
            let _result = tools.moveObjectDown(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case CANCEL_CHANGE_EPISODE_DATA: {
            return {
                ...state,
                current: [...state.initial],
                hasChanges: false,
            }
        }

        case CLEAR_EPISODE:
            return {
                ...state,
                initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                fetching: false,
            };

        case SAVE_EPISODE_SUCCESS: {
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