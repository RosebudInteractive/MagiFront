import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    SHOW_ADD_AUTHOR_DIALOG,
    SELECT_COURSE_AUTHOR,
    ADD_AUTHOR,
    REMOVE_AUTHOR,
    HIDE_ADD_AUTHOR_DIALOG,
    SHOW_ADD_CATEGORY_DIALOG,
    SELECT_COURSE_CATEGORY,
    ADD_CATEGORY,
    REMOVE_CATEGORY,
    HIDE_ADD_CATEGORY_DIALOG,
    CHANGE_DATA,
    CANCEL_CHANGE_DATA,
    SELECT_COURSE_LESSON,
    REMOVE_LESSON,
    MOVE_LESSON_UP,
    MOVE_LESSON_DOWN,
    GET_COURSE_AUTHORS_REQUEST,
    GET_COURSE_AUTHORS_SUCCESS,
    GET_COURSE_AUTHORS_FAIL,

} from '../constants/SingleCourse'

import {
    SHOW_ERROR_DIALOG,
} from '../constants/Common';


import 'whatwg-fetch';
// import {SELECT_COURSE} from "../constants/Courses";

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

export const createNewCoures = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_COURSE,
            payload: null
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

export const selectAuthor = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COURSE_AUTHOR,
            payload: id
        });
    }
};

export const addAuthor = (id) => {
    return (dispatch) => {
        dispatch({
            type: ADD_AUTHOR,
            payload: id
        });

        dispatch({
            type: SELECT_COURSE_AUTHOR,
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

export const showAddCategoryDialog = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_ADD_CATEGORY_DIALOG,
            payload: null
        });
    }
};

export const selectCategory = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COURSE_CATEGORY,
            payload: id
        });
    }
}

export const addCategory = (id) => {
    return (dispatch) => {
        dispatch({
            type: ADD_CATEGORY,
            payload: id
        });

        dispatch({
            type: SELECT_COURSE_CATEGORY,
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

export const hideAddCategoryDialog = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_ADD_CATEGORY_DIALOG,
            payload: null
        });
    }
};

export const changeData = (object) => {
    return (dispatch) => {
        dispatch({
            type: CHANGE_DATA,
            payload: object
        });
    }
};

export const cancelCanges = ()=> {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_DATA,
            payload: null
        });
    }
};

export const selectLesson = (id) => {
    return (dispatch) => {
        dispatch({
            type: SELECT_COURSE_LESSON,
            payload: id
        });
    }
}

export const removeLesson = (id) => {
    return (dispatch) => {
        dispatch({
            type: REMOVE_LESSON,
            payload: id
        });
    }
};

export const moveLessonUp = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_LESSON_UP,
            payload: id
        });
    }
};

export const moveLessonDown = (id) => {
    return (dispatch) => {
        dispatch({
            type: MOVE_LESSON_DOWN,
            payload: id
        });
    }
};

export const getCourseAuthors = (courseId) => {
    return (dispatch) => {
        dispatch({
            type: GET_COURSE_AUTHORS_REQUEST,
            payload: null
        });

        fetch("/api/courses/" + courseId + '/authors')
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
    course.ColorHex = course.Color.toString(16);

    course.Lessons.forEach((lesson) => {
        lesson.id = lesson.Id
    });
    return course;
};

const handleAuthor = (author) => {
    author.id = author.Id;
};