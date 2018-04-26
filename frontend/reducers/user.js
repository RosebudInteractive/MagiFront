import {
    SUCCESS_SIGN_IN,
    SUCCESS_SIGN_UP,
    FAIL_SIGN_IN,
    FAIL_SIGN_UP,

    AUTHORIZATION_STATE

} from '../constants/user'

const initialState = {
    authorizationState: AUTHORIZATION_STATE.START_SIGN_IN,
    authorized: false,
    name: '',
    email: ''
};

export default function app(state = initialState, action) {
    switch (action.type) {
        case SUCCESS_SIGN_IN:
            return {...state, authorized: true, size: action.payload};

        default:
            return state;
    }
}