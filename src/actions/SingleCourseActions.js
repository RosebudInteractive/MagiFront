import {
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    SHOW_ADD_AUTHOR_DIALOG,
    ADD_AUTHOR,
    REMOVE_AUTHOR,
    HIDE_ADD_AUTHOR_DIALOG,
    ADD_CATEGORY,
    REMOVE_CATEGORY,
} from '../constants/SingleCourse'

import {
    // HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    // EDIT_MODE_INSERT,
    // EDIT_MODE_EDIT,
} from '../constants/Common';


import 'whatwg-fetch';

export const getCourse = (id)=> {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_COURSE_REQUEST,
            payload: null
        });

        fetch("/api/courses/" + id)
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleCourse(data);

                dispatch({
                    type: GET_SINGLE_COURSE_SUCCESS,
                    payload: data
                })
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

export const showAddAuthorDialog = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_ADD_AUTHOR_DIALOG,
            payload: null
        });
    }
};

export const addAuthor = (id) => {
    return (dispatch) => {
        dispatch({
            type: ADD_AUTHOR,
            payload: id
        });
    }
};

export const removeAuthor = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_AUTHOR,
            payload: id
        });
    }
};

export const hideAddAuthorDialog = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_ADD_AUTHOR_DIALOG,
            payload: null
        });
    }
};

export const addCategory = (id) => {
    return (dispatch) => {
        dispatch({
            type: ADD_CATEGORY,
            payload: id
        });
    }
};

export const removeCategory = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_CATEGORY,
            payload: id
        });
    }
};




//
// export const addLesson = (id) => {
//
// };

// export const showEditDialog = (mode) => {
//     return {
//         type: SHOW_EDIT_COURSE_DLG,
//         payload: mode
//     }
// };

// export const hideEditDialog = () => {
//     return {
//         type: HIDE_EDIT_COURSE_DLG,
//         payload: null
//     }
// };

// export const selectCourse = (id) => {
//     return {
//         type: SELECT_COURSE,
//         payload: id
//     }
// };

// export const saveCourse = (values, mode) => {
//
//     return (dispatch) => {
//         let _type = mode === EDIT_MODE_INSERT ? "POST" : "PUT";
//         let _url = "/api/courses";
//         if (mode === EDIT_MODE_EDIT) {
//             _url += "/" + values.id
//         }
//         fetch(_url,
//             {
//                 method: _type,
//                 headers: {
//                     "Content-type": "application/json"
//                 },
//                 body: JSON.stringify(values)
//             })
//             .then(checkStatus)
//             .then(parseJSON)
//             .then((data) => {
//                 dispatch({
//                     type: HIDE_EDIT_COURSE_DLG,
//                     payload: data
//                 })
//             })
//             .catch((err) => {
//                 dispatch({
//                     type: SHOW_ERROR_DIALOG,
//                     payload: err.message
//                 })
//             });
//     }
// };

// export const deleteCourse = (id) => {
//     return (dispatch) => {
//         fetch("/api/courses/" + id,
//             {
//                 method: "DELETE"
//             })
//             .then(checkStatus)
//             .then(parseJSON)
//             .then(() => {
//                 dispatch({
//                     type: DELETE_COURSE_SUCCESS,
//                     payload: id
//                 })
//             })
//             .then(() => {
//                 dispatch({
//                     type: HIDE_DELETE_DLG,
//                     payload: null,
//                 })
//             })
//             .catch((err) => {
//                 dispatch({
//                     type: SHOW_ERROR_DIALOG,
//                     payload: err.message
//                 })
//             });
//
//     }
// };

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
    course.ColorHex = course.Color.toString(16);
    // course.stateName =
    return course;
};