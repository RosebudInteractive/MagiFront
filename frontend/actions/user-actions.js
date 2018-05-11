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
    LOGOUT_START,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    SWITCH_TO_SIGN_UP_SUCCESS,
} from '../constants/user'

import 'whatwg-fetch';

import {readResponseBody} from '../tools/fetch-tools'

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

                dispatch({
                    type: CLOSE_SIGN_IN_FORM,
                    payload: null
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

export const signUp = (values) => {
    return (dispatch) => {

        dispatch({
            type: SIGN_UP_START,
            payload: null
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
            type: SIGN_UP_START,
            payload: null
        });

        fetch("/api/recovery/" + values.email, {credentials: 'include'})
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
            type: SIGN_UP_START,
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


const checkStatus = (response) => {
    return new Promise((resolve, reject) => {
        if (response.status >= 200 && response.status < 300) {
            resolve(response)
        } else {
            readResponseBody(response)
                .then(data => {
                    let _message = response.statusText;

                    if (data) {
                        let _serverError = JSON.parse(data);
                        _message = _serverError.message;
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