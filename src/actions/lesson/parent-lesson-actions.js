import {
    SET_PARENT_LESSON,
    CLEAR_PARENT_LESSON,
    LOAD_PARENT_LESSON_START,
    LOAD_PARENT_LESSON_SUCCESS,
    LOAD_PARENT_LESSON_FAIL,
} from '../../constants/lesson/singleLesson'

import {SHOW_ERROR_DIALOG} from "../../constants/Common";
import {handleJsonError, checkStatus, parseJSON} from '../../tools/fetch-tools';

export const set = (lesson) => {
    return (dispatch) => {
        dispatch({
            type: SET_PARENT_LESSON,
            payload: lesson
        });
    }
};

export const clear = ()=> {
    return (dispatch) => {
        dispatch({
            type: CLEAR_PARENT_LESSON,
            payload: null
        });
    }
};

export const loadParentLessonInfo = (parentLessonId, courseId) => {
    return (dispatch) => {
        dispatch({
            type: LOAD_PARENT_LESSON_START,
            payload: null
        });

        fetch("/api/adm/lessons/" + parentLessonId + '/' + courseId, {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: LOAD_PARENT_LESSON_SUCCESS,
                    payload: {id: data.Id, name: data.Name}
                });
            })
            .catch((err) => {
                handleJsonError(err)
                    .then((message) => {
                        dispatch({
                            type: LOAD_PARENT_LESSON_FAIL,
                            payload: message
                        });

                        dispatch({
                            type: SHOW_ERROR_DIALOG,
                            payload: message
                        })
                    });
            });
    }

}