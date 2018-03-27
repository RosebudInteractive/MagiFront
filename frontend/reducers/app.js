import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
} from '../constants/app'

const initialState = {
    size: null,
    showSmallPlayer: false,
};

export default function app(state = initialState, action) {

    switch (action.type) {
        case SWITCH_SIZE_TO:
            return {...state, size: action.payload};

        case SWITCH_TO_SMALL_PLAYER:
            return {...state, showSmallPlayer: true};

        case SWITCH_TO_FULL_PLAYER:
            return {...state, showSmallPlayer: false};

        default:
            return state;
    }
}