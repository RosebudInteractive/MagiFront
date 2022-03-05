import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
    SELECT_COURSE,
    DELETE_COURSE_SUCCESS,
} from '../constants/Courses'

import {
    HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
} from '../constants/Common';

import 'whatwg-fetch';
import {checkStatus, parseJSON, handleJsonError} from '../tools/fetch-tools';

export const getCourses = () => {
    return (dispatch) => {
        dispatch({
            type: GET_COURSES_REQUEST,
            payload: null
        });

        fetch("/api/adm/courses", {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                data.forEach((course) => handleCourse(course));

                dispatch({
                    type: GET_COURSES_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: GET_COURSES_FAIL,
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

export const selectCourse = (id) => {
    return {
        type: SELECT_COURSE,
        payload: id
    }
};

// export const deleteCourse = (id) => {
const _deleteCourse = (id) => {
    return (dispatch) => {
        return fetch("/api/adm/courses/" + id,
            {
                method: "DELETE",
                credentials: 'include'
            })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: DELETE_COURSE_SUCCESS,
                    payload: id
                })
            })
            .then(() => {
                dispatch({
                    type: HIDE_DELETE_DLG,
                    payload: null,
                })
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    })

                throw new Error("Delete course error")
            });

    }
};

export const deleteCourse = (id) => {
    return (dispatch, getState) => {
        return dispatch(_deleteCourse(id))
            .then(() => {
                let _state = getState();
                return {id : id, courses : _state.courses.items}
            })
    }
}

export const cancelDelete = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_DELETE_DLG,
            payload: null,
        })
    }

};

const handleCourse = (course) => {
    course.id = course.Id;
    return course;
};