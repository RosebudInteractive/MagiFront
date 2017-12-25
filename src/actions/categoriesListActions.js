import {
    GET_CATEGORIES_REQUEST,
    GET_CATEGORIES_SUCCESS,
    GET_CATEGORIES_FAIL,
    SELECT_CATEGORY,
    DELETE_CATEGORY_SUCCESS,
    HIDE_EDIT_CATEGORY_DLG,
} from '../constants/categoriesList';

import {
    HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common';

import 'whatwg-fetch';

export const getCategories = ()=> {
    return (dispatch) => {
        dispatch({
            type: GET_CATEGORIES_REQUEST,
            payload: null
        });

        fetch("/api/categories")
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                data.forEach((category) => handleCategory(category));

                dispatch({
                    type: GET_CATEGORIES_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_CATEGORIES_FAIL,
                    payload: err
                });

                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const selectCategory = (id) => {
    return {
        type: SELECT_CATEGORY,
        payload: id
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

export const saveCategory = (values, mode) => {

    return (dispatch) => {
        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/categories";
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
                    type: HIDE_EDIT_CATEGORY_DLG,
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

export const deleteCategory = (id) => {
    return (dispatch) => {
        fetch("/api/categories/" + id,
            {
                method: "DELETE"
            })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: DELETE_CATEGORY_SUCCESS,
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

const handleCategory = (category) => {
    category.id = category.Id;
    return category;
};