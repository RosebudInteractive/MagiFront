import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,
    SELECT_MAIN_EPISODE,
    REMOVE_MAIN_EPISODE,
    MOVE_MAIN_EPISODE_UP,
    MOVE_MAIN_EPISODE_DOWN,
    SELECT_SUPP_EPISODE,
    REMOVE_SUPP_EPISODE,
    MOVE_SUPP_EPISODE_UP,
    MOVE_SUPP_EPISODE_DOWN,

    CHANGE_LESSON_DATA,
    CANCEL_CHANGE_LESSON_DATA,

    SELECT_RECOMMENDED_REFERENCE,
    INSERT_RECOMMENDED_REFERENCE,
    UPDATE_RECOMMENDED_REFERENCE,
    REMOVE_RECOMMENDED_REFERENCE,
    SELECT_COMMON_REFERENCE,
    INSERT_COMMON_REFERENCE,
    UPDATE_COMMON_REFERENCE,
    REMOVE_COMMON_REFERENCE,
    MOVE_RECOMMENDED_REFERENCE_UP,
    MOVE_RECOMMENDED_REFERENCE_DOWN,
    MOVE_COMMON_REFERENCE_UP,
    MOVE_COMMON_REFERENCE_DOWN,
    SAVE_LESSON_SUCCESS,
    CLEAR_LESSON,

} from '../constants/SingleLesson'

import {
    // HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common';


import 'whatwg-fetch';

export const get = (id, courseId)=> {
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
                });

                if (data.mainEpisodes.length > 0) {
                    dispatch({
                        type: SELECT_MAIN_EPISODE,
                        payload: data.mainEpisodes[0].id
                    });
                }

                if (data.suppEpisodes.length > 0) {
                    dispatch({
                        type: SELECT_SUPP_EPISODE,
                        payload: data.suppEpisodes[0].id
                    });
                }

                if (data.recommendedRef.length > 0) {
                    dispatch({
                        type: SELECT_RECOMMENDED_REFERENCE,
                        payload: data.recommendedRef[0].id
                    });
                }

                if (data.commonRef.length > 0) {
                    dispatch({
                        type: SELECT_COMMON_REFERENCE,
                        payload: data.commonRef[0].id
                    });
                }
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

export const create = (obj) => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_LESSON,
            payload: obj
        });
    }
};

export const save = (values, mode) => {

    return (dispatch) => {
        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/lessons";
        if (mode === EDIT_MODE_EDIT) {
            _url += "/" + values.id + '/' + values.CourseId
        } else {
            _url += "/" + values.CourseId
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
            .then((id) => {
                dispatch({
                    type: SAVE_LESSON_SUCCESS,
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
            type: CHANGE_LESSON_DATA,
            payload: object
        });
    }
};

export const cancelChanges = ()=> {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_LESSON_DATA,
            payload: null
        });
    }
};

export const clear = ()=> {
    return (dispatch) => {
        dispatch({
            type: CLEAR_LESSON,
            payload: null
        });
    }
};

export const selectMainEpisode = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_MAIN_EPISODE,
            payload: id
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

export const selectSuppEpisode = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_SUPP_EPISODE,
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

export const selectRecommendedReference = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_RECOMMENDED_REFERENCE,
            payload: id
        });
    }
};

export const insertRecommendedReference = (value) => {
    return (dispatch) => {
        dispatch({
            type: INSERT_RECOMMENDED_REFERENCE,
            payload: value
        });

        dispatch({
            type: SELECT_RECOMMENDED_REFERENCE,
            payload: value.id
        });
    }
};

export const updateRecommendedReference = (value) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_RECOMMENDED_REFERENCE,
            payload: value
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

export const moveRecommendedReferenceUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_RECOMMENDED_REFERENCE_UP,
            payload: id
        });
    }
};

export const moveRecommendedReferenceDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_RECOMMENDED_REFERENCE_DOWN,
            payload: id
        });
    }
};

export const selectCommonReference = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COMMON_REFERENCE,
            payload: id
        });
    }
};

export const insertCommonReference = (value) => {
    return (dispatch) => {
        dispatch({
            type: INSERT_COMMON_REFERENCE,
            payload: value
        });

        dispatch({
            type: SELECT_COMMON_REFERENCE,
            payload: value.id
        });
    }
};

export const updateCommonReference = (value) => {
    return (dispatch) => {
        dispatch({
            type: UPDATE_COMMON_REFERENCE,
            payload: value
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

export const moveCommonReferenceUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_COMMON_REFERENCE_UP,
            payload: id
        });
    }
};

export const moveCommonReferenceDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_COMMON_REFERENCE_DOWN,
            payload: id
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

    lesson.DT_ReadyDate = lesson.ReadyDate ? new Date(lesson.ReadyDate) : null;

    if (lesson.Episodes) {
        lesson.Episodes.forEach((episode) => {
            episode.id = episode.Id;
            if (episode.Supp) {
                lesson.suppEpisodes.push(episode)
            } else {
                lesson.mainEpisodes.push(episode)
            }
        });
    }


    lesson.recommendedRef = [];
    lesson.commonRef = [];
    if (lesson.References) {
        lesson.References.forEach((reference) => {
            reference.id = reference.Id;
            if (reference.Recommended) {
                lesson.recommendedRef.push(reference)
            } else {
                lesson.commonRef.push(reference)
            }
        });
    }

    lesson.mainEpisodes.sort((a, b) => {
       return a.Number - b.Number
    });

    lesson.suppEpisodes.sort((a, b) => {
        return a.Number - b.Number
    });

    lesson.recommendedRef.sort((a, b) => {
        return a.Number - b.Number
    });

    lesson.commonRef.sort((a, b) => {
        return a.Number - b.Number
    });
};