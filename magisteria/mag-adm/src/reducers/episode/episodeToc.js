import {
    SELECT_TOC,
    REMOVE_TOC,
    MOVE_TOC_UP,
    MOVE_TOC_DOWN,
    INSERT_TOC,
    UPDATE_TOC,
} from '../../constants/episode/episode-tocs';

import {
    CREATE_NEW_EPISODE,
    GET_SINGLE_EPISODE_REQUEST,
    GET_SINGLE_EPISODE_SUCCESS,
    SAVE_EPISODE_SUCCESS,
    CANCEL_CHANGE_EPISODE_DATA,
    CLEAR_EPISODE,
} from '../../constants/episode/singleEpisode';

import {
    EDIT_MODE_INSERT,
    // EDIT_MODE_EDIT,
} from '../../constants/Common'

import * as tools from '../tools';

const initialState = {
    initial: [],
    current: [],
    selected: null,
    hasChanges: false,
    internalId: -1,
    editMode: EDIT_MODE_INSERT,
    fetching: false,
};

export default function episodeToc(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_EPISODE:
            return {
                ...state,
                initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                internalId: -1,
                editMode: EDIT_MODE_INSERT,
                fetching: false,
            };

        case GET_SINGLE_EPISODE_REQUEST:
            return {
                ...state,
                initial: [],
                current: [],
                selected: null,
                hasChanges: false,
                internalId: -1,
                editMode: EDIT_MODE_INSERT,
                fetching: true,
            };

        case GET_SINGLE_EPISODE_SUCCESS: {
            let _data = action.payload.Toc;

            if (!_data) {
                return {
                    ...state,
                    initial: [],
                    current: [],
                    selected: null,
                    hasChanges: false,
                    internalId: -1,
                    editMode: EDIT_MODE_INSERT,
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

        case INSERT_TOC: {
            let _array = [...state.current, action.payload];
            tools.setObjectsRank(_array);

            return {...state, current: _array, hasChanges: true};
        }

        case UPDATE_TOC: {
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


        case SELECT_TOC:
            return {...state, selected: action.payload};

        case REMOVE_TOC: {
            let _result = tools.removeObject(state.current, action.payload);
            return {
                ...state,
                current: _result.resultArray,
                hasChanges: _result.modified ? true : state.hasChanges,
                selected: _result.selected ? _result.selected : state.selected
            };
        }

        case MOVE_TOC_UP: {
            let _result = tools.moveObjectUp(state.current, action.payload);
            return {...state, current: _result.resultArray, hasChanges: _result.modified ? true : state.hasChanges};
        }

        case MOVE_TOC_DOWN: {
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
                internalId: -1,
                editMode: EDIT_MODE_INSERT,
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