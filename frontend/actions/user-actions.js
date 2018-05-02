import {
    SHOW_SIGN_IN_FORM,
    CLOSE_SIGN_IN_FORM,
    SWITCH_TO_SIGN_IN,
    SWITCH_TO_SIGN_UP,
    START_SIGN_IN,
    SUCCESS_SIGN_IN,
    FAIL_SIGN_IN,
    SET_SIGN_IN_CAPTCHA,
} from '../constants/user'

import 'whatwg-fetch';

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



export const loginViaFB = () => {
    return (dispatch) => {
        dispatch({
            type: START_SIGN_IN,
            payload: null
        });

        fetch("/api/fblogin/", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SUCCESS_SIGN_IN,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: FAIL_SIGN_IN,
                    payload: err
                });
            });
    }
}

export const login = () => {
    return (dispatch, getState) => {
        let _userState = getState().user

        dispatch({
            type: START_SIGN_IN,
            payload: null
        });

        fetch("/api/fblogin/", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SUCCESS_SIGN_IN,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: FAIL_SIGN_IN,
                    payload: err
                });
            });
    }
}

const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error
    }
};

const parseJSON = (response) => {
    return response.json()
};