import {
    GET_AUTHORS_REQUEST,
    GET_AUTHORS_SUCCESS,
    GET_AUTHORS_FAIL,
    SELECT_AUTHOR,
    DELETE_AUTHOR_SUCCESS,
    SHOW_EDIT_AUTHOR_DLG,
    HIDE_EDIT_AUTHOR_DLG,
} from '../constants/Authors';

import {
    HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common';

import 'whatwg-fetch';

export const getAuthors = ()=> {
    return (dispatch) => {
        dispatch({
            type: GET_AUTHORS_REQUEST,
            payload: null
        });

        fetch("/api/authors")
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: GET_AUTHORS_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_AUTHORS_FAIL,
                    payload: err
                })
            });

    }
};

export const showEditDialog = (mode) => {
    return {
        type: SHOW_EDIT_AUTHOR_DLG,
        payload: mode
    }

};

export const hideEditDialog = () => {
    return {
        type: HIDE_EDIT_AUTHOR_DLG,
        payload: null
    }

};


export const selectAuthor = (id) => {
    return {
        type: SELECT_AUTHOR,
        payload: id
    }
};

export const saveAuthor = (values, mode) => {

    return (dispatch) => {
        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/authors";
        if (mode === EDIT_MODE_EDIT) {
            _url += "/" + values.id
        }
        fetch(_url,
            {
                method: _type,
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(values)
            })
            .then(checkStatus)
            .then(parseJSON)
            .then((data) => {
                dispatch({
                    type: HIDE_EDIT_AUTHOR_DLG,
                    payload: data
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