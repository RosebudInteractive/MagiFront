import {
    SHOW_SIGN_IN_FORM,
    CLOSE_SIGN_IN_FORM,
    SWITCH_TO_SIGN_IN,
    SWITCH_TO_SIGN_UP,
    SET_SIGN_IN_CAPTCHA,
    SIGN_IN_START,
    SIGN_IN_SUCCESS,
    SIGN_IN_FAIL,
    SIGN_UP_START,
    SIGN_UP_SUCCESS,
    SIGN_UP_FAIL,
    ACTIVATION_START,
    ACTIVATION_SUCCESS,
    ACTIVATION_FAIL,
    SWITCH_TO_RECOVERY_PASSWORD,
    SWITCH_TO_PASSWORD_CONFIRM,
    LOGOUT_START,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    SWITCH_TO_SIGN_UP_SUCCESS,
    GET_ACTIVATION_USER_START,
    GET_ACTIVATION_USER_SUCCESS,
    GET_ACTIVATION_USER_FAIL,
    RESEND_MESSAGE,
    SEND_NEW_PASSWORD_START,
    SEND_NEW_PASSWORD_SUCCESS,
    SEND_NEW_PASSWORD_FAIL,
    SWITCH_TO_RECOVERY_PASSWORD_SUCCESS,
    SWITCH_TO_RECOVERY_PASSWORD_MESSAGE,
    RECOVERY_PASSWORD_START,
    RECOVERY_PASSWORD_SUCCESS,
    RECOVERY_PASSWORD_FAIL,
} from '../constants/user'

import 'whatwg-fetch';

import {reset} from 'redux-form';

export const showSignInForm = () => {
    return {
        type: SHOW_SIGN_IN_FORM,
        payload: null
    }
};

export const closeSignInForm = () => {
    return {
        type: CLOSE_SIGN_IN_FORM,
        payload: null
    }
};

export const switchToSignIn = () => {
    return {
        type: SWITCH_TO_SIGN_IN,
        payload: null
    }
};


export const switchToSignUp = () => {
    return {
        type: SWITCH_TO_SIGN_UP,
        payload: null
    }
};

export const switchToRecoveryPassword = () => {
    return {
        type: SWITCH_TO_RECOVERY_PASSWORD,
        payload: null
    }
};

export const switchToPasswordConfirm = () => {
    return {
        type: SWITCH_TO_PASSWORD_CONFIRM,
        payload: null
    }
};


export const clearValidation = () => {
    return {
        type: SWITCH_TO_SIGN_UP,
        payload: null
    }
}

export const clearCaptcha = () => {
    return {
        type: SWITCH_TO_SIGN_UP,
        payload: null
    }
}

export const setCaptcha = (value) => {
    return {
        type: SET_SIGN_IN_CAPTCHA,
        payload: value
    }
}


export const whoAmI = () => {
    return (dispatch) => {

        dispatch({
            type: SIGN_IN_START,
            payload: null
        });

        fetch("/api/whoami", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SIGN_IN_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: SIGN_IN_FAIL,
                    payload: {error}
                });
            });
    }
}

export const login = (values) => {
    return (dispatch) => {

        dispatch({
            type: SIGN_IN_START,
            payload: null
        });

        fetch("/api/login", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(values),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SIGN_IN_SUCCESS,
                    payload: data
                });

                dispatch(reset('SignInForm'));

                dispatch({
                    type: CLOSE_SIGN_IN_FORM,
                    payload: null
                });
            })
            .catch((error) => {
                if (error.message === '"Old style" user.') {
                    dispatch({
                        type: SWITCH_TO_RECOVERY_PASSWORD,
                        payload: values
                    })
                } else {
                    dispatch({
                        type: SIGN_IN_FAIL,
                        payload: {error}
                    });
                }
            });
    }
}

export const signUp = (values) => {
    return (dispatch) => {

        dispatch({
            type: SIGN_UP_START,
            payload: values
        });

        fetch("/api/register", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(values),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SIGN_UP_SUCCESS,
                    payload: data
                });

                dispatch({
                    type: SWITCH_TO_SIGN_UP_SUCCESS,
                    payload: null
                });
            })
            .catch((error) => {
                dispatch({
                    type: SIGN_UP_FAIL,
                    payload: {error}
                });
            });
    }
}

export const recoveryPassword = (values) => {
    return (dispatch) => {
        dispatch({
            type: RECOVERY_PASSWORD_START,
            payload: {login : values.email}
        });

        fetch("/api/recovery/" + values.email, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: RECOVERY_PASSWORD_SUCCESS,
                    payload: data
                });

                dispatch({
                    type: SWITCH_TO_RECOVERY_PASSWORD_SUCCESS,
                    payload: null
                });
            })
            .catch((error) => {
                dispatch({
                    type: RECOVERY_PASSWORD_FAIL,
                    payload: {error}
                });
            });
    }
}

export const getActivationUser = (key) => {
    return (dispatch) => {

        dispatch({
            type: GET_ACTIVATION_USER_START,
            payload: null
        });

        fetch("/api/get-activated-user/" + key, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: GET_ACTIVATION_USER_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_ACTIVATION_USER_FAIL,
                    payload: {error}
                });
            });
    }
}

export const sendActivationKey = (key) => {
    return (dispatch) => {

        dispatch({
            type: ACTIVATION_START,
            payload: null
        });

        fetch("/api/activation/" + key, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: ACTIVATION_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: ACTIVATION_FAIL,
                    payload: {error}
                });
            });
    }
}

export const sendNewPassword = (values) => {
    return (dispatch) => {
        dispatch({
            type: SEND_NEW_PASSWORD_START,
            payload: null
        });

        fetch("/api/pwdrecovery", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(values),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SEND_NEW_PASSWORD_SUCCESS,
                    payload: data
                });

                dispatch({
                    type: SWITCH_TO_RECOVERY_PASSWORD_MESSAGE,
                    payload: null
                });
            })
            .catch((error) => {
                dispatch({
                    type: SEND_NEW_PASSWORD_FAIL,
                    payload: {error}
                });

                dispatch({
                    type: SWITCH_TO_RECOVERY_PASSWORD_MESSAGE,
                    payload: null
                });
            });
    }
}

export const logout = () => {
    return (dispatch) => {

        dispatch({
            type: LOGOUT_START,
            payload: null
        });

        fetch("/api/logout", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: LOGOUT_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: LOGOUT_FAIL,
                    payload: {error}
                });
            });
    }
}

export const resendMessage = (userId) =>{
    return (dispatch) => {

        dispatch({
            type: RESEND_MESSAGE,
            payload: userId
        });

        fetch("/api/reg-resend-mail/" + userId, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SIGN_UP_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: SIGN_UP_FAIL,
                    payload: {error}
                });
            });
    }
}


const checkStatus = (response) => {
    return new Promise((resolve, reject) => {
        if (response.status >= 200 && response.status < 300) {
            resolve(response)
        } else {
            // readResponseBody(response)
            response.json()
                .then(data => {
                    let _message = response.statusText;

                    if (data) {
                        let _serverError = data;
                        if (_serverError.hasOwnProperty('message')) {
                            _message = _serverError.message;
                        } else if (_serverError.hasOwnProperty('errors') && Array.isArray(_serverError.errors)) {
                            _message = _serverError.errors.join(',\n')
                        }
                    }
                    let error = new Error(_message);
                    reject(error)
                })
        }
    })
};

const parseJSON = (response) => {
    return response.json()
};