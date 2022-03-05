import {
    GET_LANGUAGES_REQUEST,
    GET_LANGUAGES_SUCCESS,
    GET_LANGUAGES_FAIL,

} from '../constants/Languages'

const initialState = {
    languages: [],
    fetching: false,
    loaded: false,
};

export default function languages(state = initialState, action) {

    switch (action.type) {
        case GET_LANGUAGES_REQUEST:
            return { ...state, languages: [], fetching: true, loaded: false, };

        case GET_LANGUAGES_SUCCESS:
            return { ...state, languages: action.payload, fetching: false, loaded: true };

        case GET_LANGUAGES_FAIL:
            return initialState;

        default:
            return state;
    }

}