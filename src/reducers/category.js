import {
    CREATE_NEW_CATEGORY,
    GET_CATEGORY_REQUEST,
    GET_CATEGORY_SUCCESS,
    GET_CATEGORY_FAIL,
    SAVE_CATEGORY_DATA,
    CHANGE_CATEGORY_DATA,
    CANCEL_CHANGE_CATEGORY_DATA,
    CLEAR_CATEGORY,
} from '../constants/category'

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges: false,
};

export default function category(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_CATEGORY: {
            let _newObject = {
                Name: '',
                ParentId: null,
            };

            return {
                ...state,
                initial: _newObject,
                current: Object.assign({}, _newObject),
                fetching: false,
                hasChanges: false,
            }
        }

        case GET_CATEGORY_REQUEST:
            return {
                ...state,
                fetching: true,
                hasError: false
            };

        case GET_CATEGORY_SUCCESS: {
            return {
                ...state,
                initial: action.payload,
                current: Object.assign({}, action.payload),
                fetching: false,
                hasChanges: false,
            };
        }

        case GET_CATEGORY_FAIL:
            return initialState;

        case SAVE_CATEGORY_DATA: {
            state.current.id = action.payload.id;
            state.current.Id = action.payload.id;

            return {
                ...state,
                initial: Object.assign({}, state.current),
                fetching: false,
                hasChanges : false,
            };
        }

        case CHANGE_CATEGORY_DATA: {
            let _object = Object.assign({}, action.payload);

            return {...state, current: _object, hasChanges: true };
        }

        case CANCEL_CHANGE_CATEGORY_DATA: {
            return {...state, current: Object.assign({}, state.initial), hasChanges: false}
        }

        case CLEAR_CATEGORY:{
            return initialState
        }

        default:
            return state;
    }

}