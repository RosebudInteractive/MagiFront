import {
    WORK_SHOP_SHOW,
    WORK_SHOP_HIDE,
    WORK_SHOP_GET_DATA_SUCCESS,
    WORK_SHOP_GET_DATA_FAIL,
    WORK_SHOP_SAVE_DATA,
} from '../constants/work-shop';

import {
    SHOW_ERROR_DIALOG,
} from '../constants/Common';

export const show = () => {
    return {
        type: WORK_SHOP_SHOW,
        payload: null
    }
};

export const hide = () => {
    return {
        type: WORK_SHOP_HIDE,
        payload: null
    }
};

export const loadData = (object) => {
    return (dispatch) => {
        fetch("/api/adm/episodes/play/" + object.episodeId + '/' + object.lessonId, {credentials: 'include'})
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

export const save = (data) => {
    return {
        type: WORK_SHOP_SAVE_DATA,
        payload: data
    }
}

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