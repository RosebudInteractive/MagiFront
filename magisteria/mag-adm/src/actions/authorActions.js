import {
    CREATE_NEW_AUTHOR,
    GET_AUTHOR_REQUEST,
    GET_AUTHOR_SUCCESS,
    GET_AUTHOR_FAIL,
    SAVE_AUTHOR_DATA_START,
    SAVE_AUTHOR_DATA_SUCCESS,
    SAVE_AUTHOR_DATA_FAIL,
    CHANGE_AUTHOR_DATA,
    CANCEL_CHANGE_AUTHOR_DATA,
    CLEAR_AUTHOR,
} from '../constants/author';

import {
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common';

import 'whatwg-fetch';
import {checkStatus, parseJSON, handleJsonError} from "../tools/fetch-tools";
import {reset} from "redux-form";

export const create = (obj) => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_AUTHOR,
            payload: obj
        });
    }
};

export const get = (id) => {
    return (dispatch) => {
        dispatch({
            type: GET_AUTHOR_REQUEST,
            payload: null
        });

        fetch("/api/adm/authors/" + id, {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleAuthor(data);

                dispatch({
                    type: GET_AUTHOR_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_AUTHOR_FAIL,
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

export const save = (values, mode) => {

    return (dispatch) => {
        dispatch({type: SAVE_AUTHOR_DATA_START})


        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/adm/authors";
        if (mode === EDIT_MODE_EDIT) {
            _url += "/" + values.id
        }

        fetch(_url,
            {
                method: _type,
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(values),
                credentials: 'include'
            })
            .then(checkStatus)
            .then(parseJSON)
            .then((result) => {
                dispatch(reset("AuthorEditor"))

                if (mode === EDIT_MODE_INSERT) {
                    values.id = result.id
                    values.Id = result.id
                }
                dispatch({
                    type: SAVE_AUTHOR_DATA_SUCCESS,
                    payload: values
                })
            })
            .catch((err) => {
                dispatch({type: SAVE_AUTHOR_DATA_FAIL})

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

export const changeData = (object) => {
    return (dispatch) => {
        dispatch({
            type: CHANGE_AUTHOR_DATA,
            payload: object
        });
    }
};

export const cancelChanges = () => {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_AUTHOR_DATA,
            payload: null
        });
    }
};

export const clear = () => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_AUTHOR,
            payload: null
        });
    }
};

const handleAuthor = (author) => {
    author.id = author.Id;
    return author;
};