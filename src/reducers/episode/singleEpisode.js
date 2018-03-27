import {
    CREATE_NEW_EPISODE,
    GET_SINGLE_EPISODE_REQUEST,
    GET_SINGLE_EPISODE_SUCCESS,
    GET_SINGLE_EPISODE_FAIL,
    CHANGE_EPISODE_DATA,
    CANCEL_CHANGE_EPISODE_DATA,
    SAVE_EPISODE_SUCCESS,
    CLEAR_EPISODE,
} from '../../constants/episode/singleEpisode'

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges: false,
};

export default function singleEpisode(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_EPISODE: {
            let _newObject = {
                Number: action.payload.Number,
                State:'D',
                EpisodeType: action.payload.EpisodeType,
                Supp: action.payload.Supp,
            };

            return {
                ...state,
                initial: _newObject,
                current: Object.assign({}, _newObject),
                fetching: false,
                hasChanges: false,
            };
        }

        case GET_SINGLE_EPISODE_REQUEST:
            return {
                ...state,
                initial: null,
                current: null,
                fetching: true,
                hasChanges: false,
            };

        case GET_SINGLE_EPISODE_SUCCESS: {
            return {
                ...state,
                initial: action.payload,
                current: Object.assign({}, action.payload),
                fetching: false,
                hasChanges : false,
            };

        }

        case GET_SINGLE_EPISODE_FAIL:
            return initialState;

        case SAVE_EPISODE_SUCCESS: {
            let _id = action.payload.id ? action.payload.id : state.current.id;
            state.current.id = _id;
            state.current.Id = _id;

            return {
                ...state,
                initial: Object.assign({}, state.current),
                fetching: false,
                hasChanges : false,
            };
        }

        case CHANGE_EPISODE_DATA : {
            let _object = Object.assign({}, action.payload);

            return {...state, current: _object, hasChanges: true };
        }

        case CANCEL_CHANGE_EPISODE_DATA: {
            return {
                ...state,
                current: Object.assign({},state.initial),
                fetching: false,
                hasChanges : false,
            };
        }

        case CLEAR_EPISODE:{
            return initialState
        }

        default:
            return state;
    }

}