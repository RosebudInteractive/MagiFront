import {
    GET_AUTHORS_LIST_REQUEST,
    GET_AUTHORS_LIST_SUCCESS,
    GET_AUTHORS_LIST_FAIL,
    SELECT_AUTHOR,
    DELETE_AUTHOR_SUCCESS,
} from '../constants/authorsList';

import {
    HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
} from '../constants/Common';

import 'whatwg-fetch';

export const getAuthors = ()=> {
    return (dispatch) => {
        dispatch({
            type: GET_AUTHORS_LIST_REQUEST,
            payload: null
        });

        fetch("/api/authors")
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                data.forEach((author) => handleAuthor(author));

                dispatch({
                    type: GET_AUTHORS_LIST_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_AUTHORS_LIST_FAIL,
                    payload: err
                })
            });

    }
};

export const selectAuthor = (id) => {
    return {
        type: SELECT_AUTHOR,
        payload: id
    }
};

export const deleteAuthor = (id) => {
    return (dispatch) => {
        fetch("/api/authors/" + id,
            {
                method: "DELETE"
            })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: DELETE_AUTHOR_SUCCESS,
                    payload: id
                })
            })
            .then(() => {
                dispatch({
                    type: HIDE_DELETE_DLG,
                    payload: null,
                })
            })
            .catch((err) => {
                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const cancelDelete = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_DELETE_DLG,
            payload: null,
        })
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

const handleAuthor = (author) => {
    author.id = author.Id;
    return author;
};