import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,
    REMOVE_MAIN_EPISODE,
    MOVE_MAIN_EPISODE_UP,
    MOVE_MAIN_EPISODE_DOWN,
    REMOVE_SUPP_EPISODE,
    MOVE_SUPP_EPISODE_UP,
    MOVE_SUPP_EPISODE_DOWN,

    CHANGE_LESSON_DATA,
    CANCEL_CHANGE_LESSON_DATA,
    REMOVE_RECOMMENDED_REFERENCE,
    REMOVE_COMMON_REFERENCE,


} from '../constants/SingleLesson'

import {
    // HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common';


import 'whatwg-fetch';

export const getLesson = (id, courseId)=> {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_LESSON_REQUEST,
            payload: null
        });

        fetch("/api/lessons/" + id + '/' + courseId)
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleLesson(data);

                dispatch({
                    type: GET_SINGLE_LESSON_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_SINGLE_LESSON_FAIL,
                    payload: err
                });

                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const createNewLesson = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_LESSON,
            payload: null
        });
    }
};

export const saveLesson = (values, mode) => {

    return (dispatch) => {
        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/lessons";
        if (mode === EDIT_MODE_EDIT) {
            _url += "/" + values.id + '/' + values.CourseId
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
            // .then((data) => {
            //     dispatch({
            //         type: HIDE_EDIT_COURSE_DLG,
            //         payload: data
            //     })
            // })
            .catch((err) => {
                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const removeMainEpisode = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_MAIN_EPISODE,
            payload: id
        });
    }
};

export const moveMainEpisodeUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_MAIN_EPISODE_UP,
            payload: id
        });
    }
};

export const moveMainEpisodeDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_MAIN_EPISODE_DOWN,
            payload: id
        });
    }
};

export const removeSuppEpisode = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_SUPP_EPISODE,
            payload: id
        });
    }
};

export const moveSuppEpisodeUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_SUPP_EPISODE_UP,
            payload: id
        });
    }
};

export const moveSuppEpisodeDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_SUPP_EPISODE_DOWN,
            payload: id
        });
    }
};

export const removeRecommendedReference = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_RECOMMENDED_REFERENCE,
            payload: id
        });
    }
};

export const removeCommonReference = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_COMMON_REFERENCE,
            payload: id
        });
    }
};

export const changeData = (object) => {
    return (dispatch) => {
        dispatch({
            type: CHANGE_LESSON_DATA,
            payload: object
        });
    }
};

export const cancelCanges = ()=> {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_LESSON_DATA,
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

const handleLesson = (lesson) => {
    lesson.id = lesson.Id;
    lesson.mainEpisodes = [];
    lesson.suppEpisodes = [];
    lesson.Episodes.forEach((episode) => {
        episode.id = episode.Id;
        if (episode.Supp) {
            lesson.suppEpisodes.push(episode)
        } else {
            lesson.mainEpisodes.push(episode)
        }
    });

    lesson.recommendedRef = [];
    lesson.commonRef = [];
    lesson.References.forEach((reference) => {
        reference.id = reference.Id;
        if (reference.Recommended) {
            lesson.recommendedRef.push(reference)
        } else {
            lesson.commonRef.push(reference)
        }
    })
};