import {
    SIGN_IN_START,

    SIGN_IN_SUCCESS,
    // SUCCESS_SIGN_UP,
    SIGN_IN_FAIL,
    SIGN_UP_FAIL,

    SIGN_UP_START,

    SWITCH_TO_SIGN_IN,
    SWITCH_TO_SIGN_UP,

    AUTHORIZATION_STATE, SIGN_UP_SUCCESS, SIGN_OUT_SUCCESS

} from '../constants/user'

const initialState = {
    authorizationState: AUTHORIZATION_STATE.START_SIGN_IN,
    authorized: false,
    loading: false,
    name: '',
    email: '',
    error: null,
    user: null,
};

export default function app(state = initialState, action) {
    const {type, payload} = action

    switch (type) {
        case SIGN_IN_START:
        case SIGN_UP_START:
            return { ...state, error: null, loading: true};

        case SIGN_IN_SUCCESS:
        case SIGN_UP_SUCCESS:
        case SIGN_OUT_SUCCESS:
            return { ...state, loading: false, user: Object.assign({}, payload)}

        case SWITCH_TO_SIGN_IN: {
            if (state.authorizationState !== AUTHORIZATION_STATE.START_SIGN_IN) {
                return {...state, authorized: true, authorizationState: AUTHORIZATION_STATE.START_SIGN_IN};
            } else {
                return state
            }
        }

        case SWITCH_TO_SIGN_UP:
            if (state.authorizationState !== AUTHORIZATION_STATE.START_SIGN_UP) {
                return {...state, authorized: true, authorizationState: AUTHORIZATION_STATE.START_SIGN_UP};
            } else {
                return state
            }

        case SIGN_IN_FAIL:
        case SIGN_UP_FAIL:
            return { ...state, loading: false, error: payload.error.message}

        default:
            return state;
    }
}