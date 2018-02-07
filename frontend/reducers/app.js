import {
    SWITCH_SIZE_TO
} from '../constants/app'

const initialState = {
    size: null,
};

export default function app(state = initialState, action) {

    switch (action.type) {
        case SWITCH_SIZE_TO:
            return {...state, size: action.payload};

        default:
            return state;
    }
}