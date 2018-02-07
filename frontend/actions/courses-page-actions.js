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
                handleCourses(data);
                // data.forEach((course) => handleCourse(course));

                dispatch({
                    type: GET_COURSES_SUCCESS,
                    payload: data
                });

                dispatch({
                    type: LOAD_FILTER_VALUES,
                    payload: data.Categories
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

const _getAuthor = (array, id) => {
    return array.find((item) => {
        return item.Id === id
    })
};

const _getCategory = (array, id) => {
    return array.find((item) => {
        return item.Id === id
    })
};

const handleCourses = (data) => {

    data.Courses.forEach((item) => {
        item.CategoriesObj = [];
        item.AuthorsObj = [];

        item.Categories.forEach((category) => {
            let _category = _getCategory(data.Categories, category);
            item.CategoriesObj.push(_category)
        });

        item.Authors.forEach((author) => {
            item.AuthorsObj.push(_getAuthor(data.Authors, author))
        });

        item.ColorHex = '#' + item.Color.toString(16);
    });
};