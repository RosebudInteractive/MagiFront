import {
    CREATE_NEW_AUTHOR,
    GET_AUTHOR_REQUEST,
    GET_AUTHOR_SUCCESS,
    GET_AUTHOR_FAIL,
    SAVE_AUTHOR_DATA_START,
    SAVE_AUTHOR_DATA_SUCCESS,
    SAVE_AUTHOR_DATA_FAIL,
} from '../constants/author'

const initialState = {
    current: null,
    fetching: false,
    saving: false,
    hasError: false,
};

export default function author(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_AUTHOR: {
            let _newObject = {
                FirstName: '',
                LastName: '',
                Description: '',
                ShortDescription: '',
            };

            return {
                ...state,
                current: Object.assign({}, _newObject),
                fetching: false,
            }
        }

        case GET_AUTHOR_REQUEST:
            return {...state, fetching: true,};

        case GET_AUTHOR_SUCCESS: {
            return {...state, current: Object.assign({}, action.payload), fetching: false,};
        }

        case GET_AUTHOR_FAIL:
            return initialState;


        case SAVE_AUTHOR_DATA_START: {
            return {...state, fetching: false, saving: true, hasError: false}
        }

        case SAVE_AUTHOR_DATA_SUCCESS: {
            let _id = action.payload.id ? action.payload.id : state.current.id;
            state.current.id = _id;
            state.current.Id = _id;

            return {
                ...state,
                current: Object.assign({}, action.payload),
                fetching: false,
                saving: false,
                hasError: false
            };
        }

        case SAVE_AUTHOR_DATA_FAIL: {
            return {...state, fetching: false, saving: false, hasError: true}
        }

        default:
            return state;
    }

}