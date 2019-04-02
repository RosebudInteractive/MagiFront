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
    SET_OG_IMAGE_RESOURCE_ID,
    SET_TWITTER_IMAGE_RESOURCE_ID,
    SET_LESSON_EXT_LINKS, SAVE_LESSON_START, SAVE_LESSON_FAIL,
} from '../../constants/lesson/singleLesson'

import {
    // HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../../constants/Common';


import 'whatwg-fetch';
import {handleJsonError, checkStatus, parseJSON} from '../../tools/fetch-tools';
import {convertLinksToString} from "../../tools/link-tools";
import {reset} from "redux-form";

export const getResources = (lessonId) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_RESOURCES_REQUEST,
            payload: null
        });

        fetch('/api/adm/lessons/resources/' + lessonId, {method: 'GET', credentials: 'include'})
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
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_LESSON_RESOURCES_FAIL,
                            payload: message
                        });

                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
            });
    }
};

export const get = (id, courseId) => {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_LESSON_REQUEST,
            payload: null
        });

        fetch("/api/adm/lessons/" + id + '/' + courseId, {method: 'GET', credentials: 'include'})
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
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_SINGLE_LESSON_FAIL,
                            payload: message
                        });

                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
            });
    }
};

export const create = (obj) => {
    return {
        type: CREATE_NEW_LESSON,
        payload: obj
    }
};

export const save = (values, mode) => {

    return (dispatch) => {
        dispatch({ type: SAVE_LESSON_START })

        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/adm/lessons";

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
            .then((data) => {
                dispatch(reset('LessonEditor'));

                dispatch({
                    type: SAVE_LESSON_SUCCESS,
                    payload: data
                })

                return mode === EDIT_MODE_INSERT ? data.id : values.id;
            })
            .then((id) => {
                dispatch(get(id, values.CourseId))
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: SAVE_LESSON_FAIL,
                            payload: message
                        })

                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
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

export const cancelChanges = () => {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_LESSON_DATA,
            payload: null
        });
    }
};

export const clear = () => {
    return {
            type: CLEAR_LESSON,
            payload: null
    }
};

export const setOgImage = (resourceId) => {
    return {
            type: SET_OG_IMAGE_RESOURCE_ID,
            payload: resourceId
    }
};

export const setTwitterImage = (resourceId) => {
    return {
            type: SET_TWITTER_IMAGE_RESOURCE_ID,
            payload: resourceId
    }
};

export const setExtLinks = (value) => {
    return {
        type: SET_LESSON_EXT_LINKS,
        payload: value
    }
}

const handleLesson = (lesson) => {
    lesson.id = lesson.Id;
    lesson.mainEpisodes = [];
    lesson.suppEpisodes = [];

    lesson.DT_ReadyDate = lesson.ReadyDate ? new Date(lesson.ReadyDate) : null;
    lesson.FreeExpDate = lesson.FreeExpDate ? new Date(lesson.FreeExpDate) : null;

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

            let _meta = JSON.parse(resource.MetaData);
            resource.FileId = _meta.fileId;
        })
    }

    if (lesson.Childs) {
        lesson.Childs.forEach((child) => {
            handleLesson(child)
        })
    }

    // if (lesson.CoverMeta) {
    //     lesson.CoverMeta = JSON.parse(lesson.CoverMeta)
    // }
    lesson.extLinksValues = convertLinksToString(lesson.ExtLinks)
};

const handleLessonResources = (resources) => {
    if (resources) {
        resources.forEach((resource) => {
            resource.id = resource.Id

            let _meta = JSON.parse(resource.MetaData);
            resource.FileId = _meta.fileId;
        })
    }
}