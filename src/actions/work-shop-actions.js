import {
    WORK_SHOP_LOAD_DATA,
    WORK_SHOP_GET_DATA_REQUEST,
    WORK_SHOP_GET_DATA_SUCCESS,
    WORK_SHOP_GET_DATA_FAIL,
} from '../constants/work-shop';

import {
    SHOW_ERROR_DIALOG,
} from '../constants/Common';

export const loadData = (object) => {
    return {
        type: WORK_SHOP_LOAD_DATA,
        payload: object
    }
};

export const get = (object) => {
    return (dispatch) => {
        dispatch({
            type: WORK_SHOP_GET_DATA_REQUEST,
            payload: null
        });

        fetch("/api/episodes/play/" + object.lessonId + '/' + object.episodeId, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: WORK_SHOP_GET_DATA_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: WORK_SHOP_GET_DATA_FAIL,
                    payload: err
                });

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