import {
    GET_CATEGORIES_REQUEST,
    GET_CATEGORIES_SUCCESS,
    GET_CATEGORIES_FAIL,
    SELECT_CATEGORY,
    DELETE_CATEGORY_SUCCESS,
} from '../constants/categoriesList';

import {
    HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
} from '../constants/Common';

import 'whatwg-fetch';
import {handleJsonError} from "../tools/fetch-tools";

export const getCategories = () => {
    return (dispatch) => {
        dispatch({
            type: GET_CATEGORIES_REQUEST,
            payload: null
        });

        fetch("/api/adm/categories", {credentials: 'include'})
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
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_CATEGORIES_FAIL,
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

export const deleteCategory = (id) => {
    return (dispatch) => {
        fetch("/api/adm/categories/" + id,
            {
                method: "DELETE",
                credentials: 'include'
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