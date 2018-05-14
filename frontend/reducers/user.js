import {
    SIGN_IN_START,

    SIGN_IN_SUCCESS,
    // SUCCESS_SIGN_UP,
    SIGN_IN_FAIL,
    SIGN_UP_FAIL,

    SIGN_UP_START,

    SWITCH_TO_SIGN_IN,
    SWITCH_TO_SIGN_UP,

    AUTHORIZATION_STATE,
    SIGN_UP_SUCCESS,
    SIGN_OUT_SUCCESS,
    ACTIVATION_SUCCESS,
    ACTIVATION_START,
    ACTIVATION_FAIL,
    SWITCH_TO_RECOVERY_PASSWORD,
    RECOVERY_FAIL,
    LOGOUT_START,
    LOGOUT_FAIL,
    LOGOUT_SUCCESS,
    SHOW_SIGN_IN_FORM,
    SWITCH_TO_SIGN_UP_SUCCESS, GET_ACTIVATION_USER_SUCCESS, GET_ACTIVATION_USER_FAIL, GET_ACTIVATION_USER_START,

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
        case SHOW_SIGN_IN_FORM:
            return {... state, error : null, loading: false, authorizationState: AUTHORIZATION_STATE.START_SIGN_IN}

        case SIGN_IN_START:
        case ACTIVATION_START:
        case LOGOUT_START:
        case GET_ACTIVATION_USER_START:
            return {...state, error: null, loading: true, email: null};

        case SIGN_UP_START:
            return {...state, error: null, loading: true, email: payload.login};

        case SIGN_IN_SUCCESS:
        case SIGN_UP_SUCCESS:
        case SIGN_OUT_SUCCESS:
        case ACTIVATION_SUCCESS:
        case GET_ACTIVATION_USER_SUCCESS:
            return {...state, loading: false, user: Object.assign({}, payload)}

        case LOGOUT_SUCCESS:
            return {...state, loading: false, user: null}

        case SWITCH_TO_SIGN_IN: {
            if (state.authorizationState !== AUTHORIZATION_STATE.START_SIGN_IN) {
                return {...state, authorizationState: AUTHORIZATION_STATE.START_SIGN_IN, error: null};
            } else {
                return state
            }
        }

        case SWITCH_TO_SIGN_UP:
            if (state.authorizationState !== AUTHORIZATION_STATE.START_SIGN_UP) {
                return {...state, authorizationState: AUTHORIZATION_STATE.START_SIGN_UP, error: null};
            } else {
                return state
            }

        case SWITCH_TO_SIGN_UP_SUCCESS:
            if (state.authorizationState !== AUTHORIZATION_STATE.SIGN_UP_SUCCESS) {
                return {...state, authorizationState: AUTHORIZATION_STATE.SIGN_UP_SUCCESS, error: null};
            } else {
                return state
            }

        case SWITCH_TO_RECOVERY_PASSWORD:
            if (state.authorizationState !== AUTHORIZATION_STATE.RECOVERY_PASSWORD) {
                return {...state, authorizationState: AUTHORIZATION_STATE.RECOVERY_PASSWORD, error: null, email: (payload ? payload.login : null)};
            } else {
                return state
            }

        case SIGN_IN_FAIL:
        case SIGN_UP_FAIL:
        case ACTIVATION_FAIL:
        case RECOVERY_FAIL:
        case LOGOUT_FAIL:
        case GET_ACTIVATION_USER_FAIL:
            return {...state, loading: false, error: payload.error.message, user: null}

        default:
            return state;
    }
}