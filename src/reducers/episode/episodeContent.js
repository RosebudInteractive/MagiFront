import {
    SELECT_EPISODE_CONTENT,
    REMOVE_EPISODE_CONTENT,
    MOVE_EPISODE_CONTENT_UP,
    MOVE_EPISODE_CONTENT_DOWN,
} from '../../constants/episode/episodeContent';

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
};

export default function episodeContent(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_EPISODE:
            return initialState;

        case GET_SINGLE_EPISODE_REQUEST:
            return initialState;

        case GET_SINGLE_EPISODE_SUCCESS: {
            let _data = action.payload.Content;

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

        case SELECT_EPISODE_CONTENT:
            return {...state, selected: action.payload};

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
            return initialState;

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