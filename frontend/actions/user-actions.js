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
    ACTIVATION_FAIL, SWITCH_TO_RECOVERY_PASSWORD,
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


export const loginViaFB = () => {
    // return (dispatch) => {
    //     dispatch({
    //         type: SIGN_IN_START,
    //         payload: null
    //     });
    //
    //     var request = new XMLHttpRequest();
    //     request.open("GET", "/api/fblogin", true);
    //     request.send();
    //
    //     request.onreadystatechange = function () {
    //         if (this.readyState == this.HEADERS_RECEIVED) {
    //
    //             // Get the raw header string
    //             var headers = request.getAllResponseHeaders();
    //
    //             // Convert the header string into an array
    //             // of individual headers
    //             var arr = headers.trim().split(/[\r\n]+/);
    //
    //             // Create a map of header names to values
    //             var headerMap = {};
    //             arr.forEach(function (line) {
    //                 var parts = line.split(': ');
    //                 var header = parts.shift();
    //                 var value = parts.join(': ');
    //                 headerMap[header] = value;
    //             });
    //         }
    //     }
    //
    //     request.addEventListener('error', ev => {
    //         console.error(ev)
    //     })
    // }

    return (dispatch) => {
        dispatch({
            type: SIGN_IN_START,
            payload: null
        });


        var myInit = {
            method: 'GET',
            mode: 'no-cors',
            // cache: 'default',
            // redirect: 'manual',
            credentials: 'include',
            header: new Headers({
                'Accept': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
            })
        };

        var myRequest = new Request('/api/fblogin', myInit);

        fetch(myRequest, myInit)
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: SIGN_IN_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: SIGN_IN_FAIL,
                    payload: err
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
        if (response.status === 0) {
            console.log(response.type); // returns basic by default
            response.blob()
                .then((myBlob) => {
                    let _url = URL.createObjectURL(myBlob)
                    resolve(_url);
                })
        } else if (response.status >= 200 && response.status < 300) {
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