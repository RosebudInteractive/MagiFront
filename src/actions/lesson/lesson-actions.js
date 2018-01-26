import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,

    CHANGE_LESSON_DATA,
    CANCEL_CHANGE_LESSON_DATA,

    GET_LESSON_RESOURCES_REQUEST,
    GET_LESSON_RESOURCES_SUCCESS,
    GET_LESSON_RESOURCES_FAIL,

    SAVE_LESSON_SUCCESS,
    CLEAR_LESSON,

} from '../../constants/lesson/singleLesson'

import {
    // HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../../constants/Common';


import 'whatwg-fetch';

export const getResources = (lessonId) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_RESOURCES_REQUEST,
            payload: null
        });

        fetch('/api/lessons/resources/' + lessonId, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleLessonResources(data);

                dispatch({
                    type: GET_LESSON_RESOURCES_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_LESSON_RESOURCES_FAIL,
                    payload: err
                });

                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const get = (id, courseId, parentLessonId)=> {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_LESSON_REQUEST,
            payload: null
        });

        fetch("/api/lessons/" + id + '/' + courseId + '/' + parentLessonId, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleLesson(data);

                dispatch({
                    type: GET_SINGLE_LESSON_SUCCESS,
                    payload: data
                });
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
            _url += "/" + values.id + '/' + values.CourseId + '/' + values.ParentId
        } else {
            _url += "/" + values.CourseId + '/' + values.ParentId
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

    if (lesson.Resources) {
        lesson.Resources.forEach((resource) => {
            resource.id = resource.Id
        })
    }

    if (lesson.Childs) {
        lesson.Childs.forEach((child) => {
            handleLesson(child)
        })
    }
};

const handleLessonResources = (resources) => {
    if (resources) {
        resources.forEach((resource) => {
            resource.id = resource.Id
        })
    }
}