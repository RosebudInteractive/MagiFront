import {
    CREATE_NEW_EPISODE,
    GET_SINGLE_EPISODE_REQUEST,
    GET_SINGLE_EPISODE_SUCCESS,
    GET_SINGLE_EPISODE_FAIL,
    CHANGE_EPISODE_DATA,
    CANCEL_CHANGE_EPISODE_DATA,
    SAVE_EPISODE_SUCCESS,
    CLEAR_EPISODE,
} from '../constants/SingleEpisode'

const initialState = {
    initialEpisode: null,
    episode: null,
    fetching: false,
    hasChanges: false,
};

export default function singleEpisode(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_EPISODE: {
            let _episode = {
                Number: action.payload.Number,
                State:'D',
                EpisodeType: action.payload.LessonType,
                Supp: action.payload.Supp,
            };

            return {
                ...state,
                initialEpisode: _episode,
                episode: Object.assign({}, _episode),
                fetching: false,
                hasChanges: false,
            };
        }

        case GET_SINGLE_EPISODE_REQUEST:
            return {
                ...state,
                initialEpisode: null,
                episode: null,
                fetching: true,
                hasChanges: false,
            };

        case GET_SINGLE_EPISODE_SUCCESS: {
            return {
                ...state,
                initialEpisode: action.payload,
                episode: Object.assign({}, action.payload),
                fetching: false,
                hasChanges : false,
            };

        }

        case GET_SINGLE_EPISODE_FAIL:
            return initialState;

        case SAVE_EPISODE_SUCCESS: {

            return {
                ...state,
                initialEpisode: Object.assign({}, state.episode),
                fetching: false,
                hasChanges : false,
            };
        }

        case CHANGE_EPISODE_DATA : {
            let _object = Object.assign({}, action.payload);

            return {...state, episode: _object, hasChanges: true };
        }

        case CANCEL_CHANGE_EPISODE_DATA: {
            return {
                ...state,
                episode: Object.assign({},state.initialEpisode),
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