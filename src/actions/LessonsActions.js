// import {
//     HIDE_DELETE_DLG,
//     SHOW_ERROR_DIALOG,
//     EDIT_MODE_INSERT,
//     EDIT_MODE_EDIT,
// } from '../constants/Common';

import 'whatwg-fetch';

import {SELECT_LESSON} from "../constants/Lessons";

export const getLessons = ()=> {
    // return (dispatch) => {
    //     dispatch({
    //         type: GET_COURSES_REQUEST,
    //         payload: null
    //     });
    //
    //     fetch("/api/courses")
    //         .then(checkStatus)
    //         .then(parseJSON)
    //         .then(data => {
    //             data.forEach((course) => handleCourse(course));
    //
    //             dispatch({
    //                 type: GET_COURSES_SUCCESS,
    //                 payload: data
    //             })
    //         })
    //         .catch((err) => {
    //             dispatch({
    //                 type: GET_COURSES_FAIL,
    //                 payload: err
    //             });
    //
    //             dispatch({
    //                 type: SHOW_ERROR_DIALOG,
    //                 payload: err.message
    //             })
    //         });
    //
    // }
};

// export const showEditDialog = (mode) => {
//     return {
//         type: SHOW_EDIT_COURSE_DLG,
//         payload: mode
//     }
//
// };

// export const hideEditDialog = () => {
//     return {
//         type: HIDE_EDIT_COURSE_DLG,
//         payload: null
//     }
//
// };


export const selectLesson = (id) => {
    return {
        type: SELECT_LESSON,
        payload: id
    }
};

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
//
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

// const checkStatus = (response) => {
//     if (response.status >= 200 && response.status < 300) {
//         return response
//     } else {
//         let error = new Error(response.statusText);
//         error.response = response;
//         throw error
//     }
// };

// const parseJSON = (response) => {
//     return response.json()
// };

// const handleCourse = (course) => {
//     course.id = course.Id;
//     // course.stateName =
//     return course;
//};