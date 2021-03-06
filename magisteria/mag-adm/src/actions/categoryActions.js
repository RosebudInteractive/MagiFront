import {
    CREATE_NEW_CATEGORY,
    GET_CATEGORY_REQUEST,
    GET_CATEGORY_SUCCESS,
    GET_CATEGORY_FAIL,
    SAVE_CATEGORY_DATA,
    CHANGE_CATEGORY_DATA,
    CANCEL_CHANGE_CATEGORY_DATA,
    CLEAR_CATEGORY,
} from '../constants/category';

import {
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common';

import 'whatwg-fetch';
import {checkStatus, parseJSON, handleJsonError} from "../tools/fetch-tools";

export const create = (obj) => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_CATEGORY,
            payload: obj
        });
    }
};

export const get = (id)=> {
    return (dispatch) => {
        dispatch({
            type: GET_CATEGORY_REQUEST,
            payload: null
        });

        fetch("/api/adm/categories/" + id, {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleCategory(data);

                dispatch({
                    type: GET_CATEGORY_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_CATEGORY_FAIL,
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
        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/adm/categories";
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
            .then((id) => {
                dispatch({
                    type: SAVE_CATEGORY_DATA,
                    payload: id
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

export const changeData = (object) => {
    return (dispatch) => {
        dispatch({
            type: CHANGE_CATEGORY_DATA,
            payload: object
        });
    }
};

export const cancelChanges = ()=> {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_CATEGORY_DATA,
            payload: null
        });
    }
};

export const clear = ()=> {
    return (dispatch) => {
        dispatch({
            type: CLEAR_CATEGORY,
            payload: null
        });
    }
};

const handleCategory = (category) => {
    category.id = category.Id;
    return category;
};