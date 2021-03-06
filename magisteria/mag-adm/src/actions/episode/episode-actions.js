import {
    CREATE_NEW_EPISODE,
    GET_SINGLE_EPISODE_REQUEST,
    GET_SINGLE_EPISODE_SUCCESS,
    GET_SINGLE_EPISODE_FAIL,
    CHANGE_EPISODE_DATA,
    CANCEL_CHANGE_EPISODE_DATA,
    SAVE_EPISODE_SUCCESS,
    CLEAR_EPISODE,
    IMPORT_EPISODE_SUCCESS, IMPORT_EPISODE_START, IMPORT_EPISODE_FAIL, SAVE_EPISODE_START, SAVE_EPISODE_FAIL,
} from '../../constants/episode/singleEpisode'

import {
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../../constants/Common';


import 'whatwg-fetch';
import {checkStatus, parseJSON, handleJsonError, NOT_FOUND_ERR} from "../../tools/fetch-tools";
import {reset} from "redux-form";

export const get = (id, lessonId) => {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_EPISODE_REQUEST,
            payload: null
        });

        fetch("/api/episodes/" + id + '/' + lessonId, {method: 'GET', credentials: 'include'})
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
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_SINGLE_EPISODE_FAIL,
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
        dispatch({ type: SAVE_EPISODE_START })

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
            .then((data) => {
                dispatch(reset('EpisodeEditor'));

                dispatch({
                    type: SAVE_EPISODE_SUCCESS,
                    payload: data
                })

                return mode === EDIT_MODE_INSERT ? data.id : values.id;
            })
            .then((id) => {
                dispatch(get(id, values.LessonId))
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({ type: SAVE_EPISODE_FAIL, payload: message })

                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
            })
    }
};

export const uploadPackage = (object) => {
    return (dispatch) => {

        dispatch({
            type: IMPORT_EPISODE_START,
            payload: null
        })

        let data = new FormData()
        data.append('file', object.file)
        data.append('idEpisode', object.idEpisode)
        data.append('idLesson', object.idLesson)

        fetch('/api/adm/import',
            {
                method: 'POST',
                body: data,
                credentials: 'include'
            })
            .then(checkStatus)
            .then(parseJSON)
            .then((data) => {
                if (data.result === 'OK') {
                    dispatch({
                        type: IMPORT_EPISODE_SUCCESS,
                        payload: null
                    })

                    dispatch(get(object.idEpisode, object.idLesson))
                } else if (data.result === 'WARN') {
                    dispatch({
                        type: SHOW_ERROR_DIALOG,
                        payload: data.warnings.join('\n')
                    })

                    dispatch({
                        type: IMPORT_EPISODE_FAIL,
                        payload: null
                    })
                } else {
                    let _message = (data.errors.length > 0) ? data.errors.join('\n') : data.message;

                    dispatch({
                        type: SHOW_ERROR_DIALOG,
                        payload: _message
                    })

                    dispatch({
                        type: IMPORT_EPISODE_FAIL,
                        payload: null
                    })
                }
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
            });

    }
}

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

    if (episode.AudioMeta) {
        episode.AudioMeta = JSON.parse(episode.AudioMeta)
    }
};