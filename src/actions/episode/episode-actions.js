import {
    CREATE_NEW_EPISODE,
    GET_SINGLE_EPISODE_REQUEST,
    GET_SINGLE_EPISODE_SUCCESS,
    GET_SINGLE_EPISODE_FAIL,
    CHANGE_EPISODE_DATA,
    CANCEL_CHANGE_EPISODE_DATA,
    SAVE_EPISODE_SUCCESS,
    CLEAR_EPISODE,
} from '../../constants/episode/singleEpisode'

import {
    // HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../../constants/Common';


import 'whatwg-fetch';

export const get = (id, lessonId) => {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_EPISODE_REQUEST,
            payload: null
        });

        fetch("/api/episodes/" + id + '/' + lessonId, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleEpisode(data);

                dispatch({
                    type: GET_SINGLE_EPISODE_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_SINGLE_EPISODE_FAIL,
                    payload: err
                });

                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const create = (obj) => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_EPISODE,
            payload: obj
        });
    }
};

export const save = (values, mode) => {

    return (dispatch) => {
        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/episodes";
        if (mode === EDIT_MODE_EDIT) {
            _url += "/" + values.id + '/' + values.LessonId
        } else {
            _url += "/" + values.LessonId
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
                    type: SAVE_EPISODE_SUCCESS,
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
};

export const changeData = (object) => {
    return (dispatch) => {
        dispatch({
            type: CHANGE_EPISODE_DATA,
            payload: object
        });
    }
};

export const cancelChanges = () => {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_EPISODE_DATA,
            payload: null
        });
    }
};

export const clear = () => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_EPISODE,
            payload: null
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

const handleEpisode = (episode) => {
    episode.id = episode.Id;

    episode.Toc.forEach((item) => {
        item.id = item.Id
    });

    episode.Content.forEach((item) => {
        item.id = item.Id;

        let _obj = {};
        try {
            _obj = JSON.parse(item.Content);
        }
        catch (e) {
            _obj.Name = '';
            _obj.Description = '';
        }

        item.Name = _obj.title;
        item.Description = _obj.title2;
    });
};