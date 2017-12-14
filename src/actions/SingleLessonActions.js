import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,

    CHANGE_LESSON_DATA,
    CANCEL_CHANGE_LESSON_DATA,

} from '../constants/SingleLesson'

import {
    // HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
    // EDIT_MODE_INSERT,
    // EDIT_MODE_EDIT,
} from '../constants/Common';


import 'whatwg-fetch';

export const getLesson = (id, courseId)=> {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_LESSON_REQUEST,
            payload: null
        });

        fetch("/api/lessons/" + id + '/' + courseId)
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleLesson(data);

                dispatch({
                    type: GET_SINGLE_LESSON_SUCCESS,
                    payload: data
                })
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

export const createNewLesson = () => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_LESSON,
            payload: null
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

export const cancelCanges = ()=> {
    return (dispatch) => {
        dispatch({
            type: CANCEL_CHANGE_LESSON_DATA,
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
    // course.ColorHex = course.Color.toString(16);
    //
    // course.Lessons.forEach((lesson) => {
    //     lesson.id = lesson.Id
    // });
    // return course;
};