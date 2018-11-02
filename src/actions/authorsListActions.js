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
import {checkStatus, parseJSON, handleJsonError} from '../tools/fetch-tools';

export const getAuthors = () => {
    return (dispatch) => {
        dispatch({
            type: GET_AUTHORS_LIST_REQUEST,
            payload: null
        });

        fetch("/api/adm/authors", {credentials: 'include'})
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
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_AUTHORS_LIST_FAIL,
                            payload: message
                        })
                    });
            })
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
        fetch("/api/adm/authors/" + id,
            {
                method: "DELETE",
                credentials: 'include'
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
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
            })
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

const handleAuthor = (author) => {
    author.id = author.Id;
    return author;
};