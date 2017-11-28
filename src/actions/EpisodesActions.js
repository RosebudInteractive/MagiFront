/**
 * Created by levan.kiknadze on 12/11/2017.
 */

import {
    GET_EPISODES_REQUEST,
    GET_EPISODES_SUCCESS,
    GET_EPISODES_FAIL,
    SELECT_EPISODE,
    SHOW_DELETE_DLG,
    DELETE_EPISODE_SUCCESS,
    SHOW_ERROR_DIALOG,
    HIDE_ERROR_DIALOG,
    HIDE_DELETE_DLG,
    SHOW_EDIT_DLG,
    HIDE_EDIT_DLG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Episodes'
import 'whatwg-fetch'

export function getEpisodes() {

    return (dispatch) => {
        dispatch({
            type: GET_EPISODES_REQUEST,
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
}

export function showDeleteConfirmation() {
    return {
        type: SHOW_DELETE_DLG,
        payload: null
    }
}

export const selectEpisode = (id) => {
    return {
        type: SELECT_EPISODE,
        payload: id
    }
}

export const cancelDelete = () => {
    return {
        type: HIDE_DELETE_DLG,
        payload: null
    }
}

export const confirmError = () => {
    return {
        type: HIDE_ERROR_DIALOG,
        payload: null
    }
}

export const deleteEpisode = (id) => {
    return (dispatch) => {
        fetch("/api/episodes/" + id,
            {
                method: "DELETE"
            })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: DELETE_EPISODE_SUCCESS,
                    payload: id
                })
            })
            .catch((err) => {
                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
}

export const showEditDialog = (mode) => {
    return {
        type: SHOW_EDIT_DLG,
        payload: mode
    }

}

export const hideEditDialog = () => {
    return {
        type: HIDE_EDIT_DLG,
        payload: null
    }

}

export const saveEpisode = (values, mode) => {

    return (dispatch) => {
        var type = mode == EDIT_MODE_INSERT ? "POST" : "PUT"
        var url = "/api/episodes"
        if (mode == EDIT_MODE_EDIT) {
            url += "/" + values.id
        }
        fetch(url,
            {
                method: type,
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(values)
            })
            .then(checkStatus)
            .then(parseJSON)
            .then((data) => {
                dispatch({
                    type: HIDE_EDIT_DLG,
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
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
    }
}



function parseJSON(response) {
    return response.json()
}
