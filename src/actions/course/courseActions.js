import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    CHANGE_COURSE_DATA,
    CANCEL_CHANGE_COURSE_DATA,
    CLEAR_COURSE,
    SAVE_COURSE_DATA,
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

export const create = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_COURSE,
            payload: null
        });
    }
};

export const get = (id)=> {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_COURSE_REQUEST,
            payload: null
        });

        fetch("/api/adm/courses/" + id, {credentials: 'include'})
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
                dispatch({
                    type: GET_SINGLE_COURSE_FAIL,
                    payload: err
                });

                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const save = (values, mode) => {

    return (dispatch) => {
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
                dispatch({
                    type: SAVE_COURSE_DATA,
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
            type: CHANGE_COURSE_DATA,
            payload: object
        });
    }
};

export const cancelChanges = ()=> {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_COURSE_DATA,
            payload: null
        });
    }
};

export const clear = ()=> {
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

        fetch("/api/adm/courses/" + courseId + '/authors', {credentials: 'include'})
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
                dispatch({
                    type: GET_COURSE_AUTHORS_FAIL,
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

const handleCourse = (course) => {
    course.id = course.Id;
    course.ColorHex = course.Color.toString(16).padStart(6, "0");
    course.Mask = course.Mask ? course.Mask : '_mask01';

    course.Lessons.forEach((lesson) => {
        lesson.id = lesson.Id
    });
    return course;
};

const handleAuthor = (author) => {
    author.id = author.Id;
};