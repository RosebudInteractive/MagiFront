import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    CHANGE_COURSE_DATA,
    CANCEL_CHANGE_COURSE_DATA,
    CLEAR_COURSE,
    SAVE_COURSE_START,
    SAVE_COURSE_SUCCESS,
    SAVE_COURSE_FAIL,
    SET_COURSE_EXT_LINKS,
} from '../../constants/course/singleCourse'

import {
    GET_COURSE_AUTHORS_REQUEST,
    GET_COURSE_AUTHORS_SUCCESS,
    GET_COURSE_AUTHORS_FAIL,
} from '../../constants/course/courseAuthorsList';

import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
    SHOW_ERROR_DIALOG,
} from '../../constants/Common';

import 'whatwg-fetch';
import {parseJSON, handleJsonError, checkStatus} from '../../tools/fetch-tools';
import {convertLinksToString} from "../../tools/link-tools";
import {reset} from 'redux-form'

export const create = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_COURSE,
            payload: null
        });
    }
};

export const get = (id) => {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_COURSE_REQUEST,
            payload: null
        });

        fetch("/api/adm/courses/" + id, {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleCourse(data);

                dispatch({
                    type: GET_SINGLE_COURSE_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_SINGLE_COURSE_FAIL,
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

export const save = (values, mode) => {

    return (dispatch) => {
        dispatch({
            type: SAVE_COURSE_START,
            payload: null
        });

        let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
        let _url = "/api/adm/courses";
        if (mode === EDIT_MODE_EDIT) {
            _url += "/" + values.id
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
                dispatch(reset('CourseEditor'));

                dispatch({
                    type: SAVE_COURSE_SUCCESS,
                    payload: id
                })
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: SAVE_COURSE_FAIL,
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

export const changeData = (object) => {
    return (dispatch) => {
        dispatch({
            type: CHANGE_COURSE_DATA,
            payload: object
        });
    }
};

export const cancelChanges = () => {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_COURSE_DATA,
            payload: null
        });
    }
};

export const clear = () => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_COURSE,
            payload: null
        });
    }
};

export const getCourseAuthors = (courseId) => {
    return (dispatch) => {
        dispatch({
            type: GET_COURSE_AUTHORS_REQUEST,
            payload: null
        });

        fetch("/api/adm/courses/" + courseId + '/authors', {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                data.forEach((course) => handleAuthor(course));

                dispatch({
                    type: GET_COURSE_AUTHORS_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_COURSE_AUTHORS_FAIL,
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

export const setExtLinks = (value) => {
    return {
        type: SET_COURSE_EXT_LINKS,
        payload: value
    }
}

const handleCourse = (course) => {
    course.id = course.Id;
    course.Mask = course.Mask ? course.Mask : '_mask01';
    course.extLinksValues = convertLinksToString(course.ExtLinks)

    course.Lessons.forEach((lesson) => {
        lesson.id = lesson.Id
    });
    return course;
};

const handleAuthor = (author) => {
    author.id = author.Id;
};