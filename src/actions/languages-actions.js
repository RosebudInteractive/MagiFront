import {
    GET_LANGUAGES_REQUEST,
    GET_LANGUAGES_SUCCESS,
    GET_LANGUAGES_FAIL,
} from '../constants/Languages'

import {
    SHOW_ERROR_DIALOG,
} from '../constants/Common';


import 'whatwg-fetch';
import {checkStatus, parseJSON, handleJsonError} from '../tools/fetch-tools';

export const getLanguages = ()=> {
    return (dispatch) => {
        dispatch({
            type: GET_LANGUAGES_REQUEST,
            payload: null
        });

        fetch("/api/languages/", {method: 'GET', credentials: 'include'})
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
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_LANGUAGES_FAIL,
                            payload: message
                        });

                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
            })

    }
};

const handleLanguage = (language) => {
    language.id = language.Id;
    // course.stateName =
    return language;
};