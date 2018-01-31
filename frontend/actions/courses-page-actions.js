import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
    // SELECT_COURSE,
    // DELETE_COURSE_SUCCESS,
} from '../constants/courses'

import {
    LOAD_FILTER_VALUES,
} from '../constants/filters'

import 'whatwg-fetch';

export const getCourses = ()=> {
    return (dispatch) => {
        dispatch({
            type: GET_COURSES_REQUEST,
            payload: null
        });

        fetch("/api/courses", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                let _filters = handleCourses(data);
                // data.forEach((course) => handleCourse(course));

                dispatch({
                    type: GET_COURSES_SUCCESS,
                    payload: data
                });

                dispatch({
                    type: LOAD_FILTER_VALUES,
                    payload: _filters
                })
            })
            .catch((err) => {
                dispatch({
                    type: GET_COURSES_FAIL,
                    payload: err
                });

                // dispatch({
                //     type: SHOW_ERROR_DIALOG,
                //     payload: err.message
                // })
            });

    }
};

// export const selectCourse = (id) => {
//     return {
//         type: SELECT_COURSE,
//         payload: id
//     }
// };
//
// export const deleteCourse = (id) => {
//     return (dispatch) => {
//         fetch("/api/adm/courses/" + id,
//             {
//                 method: "DELETE",
//                 credentials: 'include'
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

// export const cancelDelete = () => {
//     return (dispatch) => {
//         dispatch({
//             type: HIDE_DELETE_DLG,
//             payload: null,
//         })
//     }
//
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

// const handleCourse = (course) => {
//     // course.id = course.Id;
//     course.ColorHex = '#' + course.Color.toString(16);
//
//     // course.stateName =
//     return course;
// };

const handleCourses = (data) => {
    let _categories = {};

    data.forEach((item) => {
        item.Categories.forEach((category) => {
            _categories[category.Name] ? _categories[category.Name]++ : _categories[category.Name] = 1
        });

        item.ColorHex = '#' + item.Color.toString(16);
    });

    return _categories;
};