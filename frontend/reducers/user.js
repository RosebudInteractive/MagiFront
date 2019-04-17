import {
    SIGN_IN_START,

    SIGN_IN_SUCCESS,
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
    SWITCH_TO_PASSWORD_CONFIRM,
    LOGOUT_START,
    LOGOUT_FAIL,
    LOGOUT_SUCCESS,
    SHOW_SIGN_IN_FORM,
    SWITCH_TO_SIGN_UP_SUCCESS,
    GET_ACTIVATION_USER_SUCCESS,
    GET_ACTIVATION_USER_FAIL,
    GET_ACTIVATION_USER_START,
    SWITCH_TO_RECOVERY_PASSWORD_MESSAGE,
    SEND_NEW_PASSWORD_START,
    SEND_NEW_PASSWORD_SUCCESS,
    SEND_NEW_PASSWORD_FAIL,
    SWITCH_TO_RECOVERY_PASSWORD_SUCCESS,
    RECOVERY_PASSWORD_START,
    RECOVERY_PASSWORD_SUCCESS,
    RECOVERY_PASSWORD_FAIL, CLOSE_SIGN_IN_FORM,
    WHO_AM_I_START,
    WHO_AM_I_SUCCESS,
    WHO_AM_I_FAIL, REDIRECT_TO_APP, REDIRECT_TO_APP_COMPLETE,
} from '../constants/user'

const initialState = {
    authorizationState: AUTHORIZATION_STATE.NONE,
    // authorizationState: AUTHORIZATION_STATE.START_SIGN_IN,
    authorized: false,
    loading: false,
    name: '',
    email: '',
    error: null,
    user: null,
    msgUrl: '#',
    isAdmin: false,
    redirect: {active: false, url: ''},
};

export default function app(state = initialState, action) {
    const {type, payload} = action

    switch (type) {
        case SHOW_SIGN_IN_FORM:
            return {...state, error: null, loading: false, authorizationState: AUTHORIZATION_STATE.START_SIGN_IN}

        case CLOSE_SIGN_IN_FORM:{
            return {...state, error: null, loading: false, authorizationState: AUTHORIZATION_STATE.NONE}
        }

        case SIGN_IN_START:
        case WHO_AM_I_START:
        case ACTIVATION_START:
        case LOGOUT_START:
        case SEND_NEW_PASSWORD_START:
        case GET_ACTIVATION_USER_START:
            return {...state, error: null, loading: true, email: null};

        case SIGN_UP_START:
        case RECOVERY_PASSWORD_START:
            return {...state, error: null, loading: true, email: payload.login};

        case SIGN_IN_SUCCESS:
        case WHO_AM_I_SUCCESS:
        case SIGN_UP_SUCCESS:
        case SIGN_OUT_SUCCESS:
        case ACTIVATION_SUCCESS:
        case SEND_NEW_PASSWORD_SUCCESS:
        case GET_ACTIVATION_USER_SUCCESS: {
            let _user = Object.assign({}, payload)
            
            _user.isAdmin = _isUserAdmin(payload)
            return {...state, loading: false, user: _user, email: _user.Email}
        }

        case RECOVERY_PASSWORD_SUCCESS:
            return {...state, loading: false, user: null, msgUrl: payload.PData ? payload.PData.msgUrl : '#', }

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

        case SWITCH_TO_RECOVERY_PASSWORD_SUCCESS:
            if (state.authorizationState !== AUTHORIZATION_STATE.RECOVERY_PASSWORD_SUCCESS) {
                return {...state, authorizationState: AUTHORIZATION_STATE.RECOVERY_PASSWORD_SUCCESS, error: null};
            } else {
                return state
            }

        case SWITCH_TO_RECOVERY_PASSWORD:
            if (state.authorizationState !== AUTHORIZATION_STATE.RECOVERY_PASSWORD) {
                return {
                    ...state,
                    authorizationState: AUTHORIZATION_STATE.RECOVERY_PASSWORD,
                    error: null,
                    email: (payload ? payload.login : null)
                };
            } else {
                return state
            }

        case SWITCH_TO_PASSWORD_CONFIRM:
            if (state.authorizationState !== AUTHORIZATION_STATE.PASSWORD_CONFIRM) {
                return {...state, authorizationState: AUTHORIZATION_STATE.PASSWORD_CONFIRM, error: null};
            } else {
                return state
            }

        case SWITCH_TO_RECOVERY_PASSWORD_MESSAGE:
            if (state.authorizationState !== AUTHORIZATION_STATE.PASSWORD_CONFIRM_FINISHED) {
                return {...state, authorizationState: AUTHORIZATION_STATE.PASSWORD_CONFIRM_FINISHED,};
            } else {
                return state
            }

        case SIGN_IN_FAIL:
        case WHO_AM_I_FAIL:
        case SIGN_UP_FAIL:
        case ACTIVATION_FAIL:
        case RECOVERY_PASSWORD_FAIL:
        case LOGOUT_FAIL:
        case SEND_NEW_PASSWORD_FAIL:
        case GET_ACTIVATION_USER_FAIL:
            return {...state, loading: false, error: payload.error.message, user: null}

        case REDIRECT_TO_APP:
            return {...state, loading: false, redirect: {active: true, url: payload}}

        case REDIRECT_TO_APP_COMPLETE:
            return {...state, redirect: {active: false, url:''}}

        default:
            return state;
    }
}

const _isUserAdmin = (data) => {
    let _rights = data.PData;
    return _rights && (_rights.isAdmin || (_rights.roles && _rights.roles.e))
}