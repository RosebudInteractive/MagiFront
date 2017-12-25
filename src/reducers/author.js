import {
    CREATE_NEW_AUTHOR,
    GET_AUTHOR_REQUEST,
    GET_AUTHOR_SUCCESS,
    GET_AUTHOR_FAIL,
    CHANGE_AUTHOR_DATA,
    CANCEL_CHANGE_AUTHOR_DATA,
    SAVE_AUTHOR_DATA,
    CLEAR_AUTHOR,
} from '../constants/author'

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges: false,
};

export default function authorsList(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_AUTHOR: {
            let _newObject = {
                FirstName: '',
                LastName: '',
                Description: '',
            };

            return {
                ...state,
                initial: _newObject,
                current: Object.assign({}, _newObject),
                fetching: false,
                hasChanges: false,
            }
        }

        case GET_AUTHOR_REQUEST:
            return {
                ...state,
                fetching: true,
                hasError: false
            };

        case GET_AUTHOR_SUCCESS: {
            return {
                ...state,
                initial: action.payload,
                current: Object.assign({}, action.payload),
                fetching: false,
                hasChanges: false,
            };
        }

        case GET_AUTHOR_FAIL:
            return initialState;

        case SAVE_AUTHOR_DATA: {
            state.current.id = action.payload.id;
            state.current.Id = action.payload.id;

            return {
                ...state,
                initial: Object.assign({}, state.current),
                fetching: false,
                hasChanges : false,
            };
        }

        case CHANGE_AUTHOR_DATA: {
            let _object = Object.assign({}, action.payload);

            return {...state, current: _object, hasChanges: true };
        }

        case CANCEL_CHANGE_AUTHOR_DATA: {
            return {...state, current: Object.assign({}, state.initial), hasChanges: false}
        }

        case CLEAR_AUTHOR:{
            return initialState
        }

        default:
            return state;
    }

}