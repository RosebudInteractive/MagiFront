import {
    GET_AUTHORS_REQUEST,
    GET_AUTHORS_SUCCESS,
    GET_AUTHORS_FAIL,
} from '../constants/Authors';

import 'whatwg-fetch';

export const getAuthors = ()=>{
    return (dispatch) => {
        dispatch({
            type: GET_AUTHORS_REQUEST,
            payload: null
        });

        fetch("/api/episodes")
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: GET_EPISODES_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_EPISODES_FAIL,
                    payload: err
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