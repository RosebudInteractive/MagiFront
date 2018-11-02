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

import {checkStatus, parseJSON, handleJsonError} from '../tools/fetch-tools';

export const show = (callingRoute) => {
    return {
        type: WORK_SHOP_SHOW,
        payload: callingRoute
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
                data.callingRoute = object.callingRoute
                dispatch({
                    type: WORK_SHOP_GET_DATA_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: WORK_SHOP_GET_DATA_FAIL,
                            payload: message
                        });

                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
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