import {
    GET_LANGUAGES_REQUEST,
    GET_LANGUAGES_SUCCESS,
    GET_LANGUAGES_FAIL,
} from '../constants/Languages'

import {
    SHOW_ERROR_DIALOG,
} from '../constants/Common';


import 'whatwg-fetch';

export const getLanguages = ()=> {
    return (dispatch) => {
        dispatch({
            type: GET_LANGUAGES_REQUEST,
            payload: null
        });

        fetch("/api/languages/", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                data.forEach((language) => handleLanguage(language));

                dispatch({
                    type: GET_LANGUAGES_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_LANGUAGES_FAIL,
                    payload: err
                });

                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

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

const handleLanguage = (language) => {
    language.id = language.Id;
    // course.stateName =
    return language;
};