import {
    PLAYER_PLAYED,
    PLAYER_PAUSED,
    PLAYER_SET_CURRENT_TIME,
    PLAYER_SET_TITLE,
} from '../constants/player'

const initialState = {
    currentTime: 0,
    paused: true,
    title: '',
};

export default function player(state = initialState, action) {

    switch (action.type) {
        case PLAYER_PLAYED:
            return {...state, paused: false};

        case PLAYER_PAUSED:
            return {...state, paused: true};

        case PLAYER_SET_CURRENT_TIME:
            return {...state, currentTime: action.payload};

        case PLAYER_SET_TITLE: {
            return {...state, title: action.payload}
        }

        default:
            return state;
    }
}