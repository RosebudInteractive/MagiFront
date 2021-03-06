import {
    GET_LESSON_REQUEST,
    GET_LESSON_SUCCESS,
    GET_LESSON_FAIL,
    GET_LESSON_TEXT_REQUEST,
    GET_LESSON_TEXT_SUCCESS,
    GET_LESSON_TEXT_FAIL,
    CLEAR_LESSON_PLAY_INFO,
    START_LESSON_PLAYING,
    CLEAR_LESSON,
    SET_LESSON_NOT_FOUND,
    SET_LESSON_TEXT_NOT_FOUND,
} from '../constants/lesson'

import 'whatwg-fetch';
import {parseReadyDate} from "tools/time-tools";
import CourseDiscounts from "tools/course-discount";




export const clearLesson = () => {
    return {
        type: CLEAR_LESSON,
        payload: null
    }
}

export const getLesson = (courseUrl, lessonUrl) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_REQUEST,
            payload: null
        });

        fetch("/api/lessons/v2/" + courseUrl + '/' + lessonUrl, {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleData(data);
                dispatch({
                    type: GET_LESSON_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                if (err.status === 404) {
                    dispatch({
                        type: SET_LESSON_NOT_FOUND,
                        payload: null
                    });
                } else {
                    dispatch({
                        type: GET_LESSON_FAIL,
                        payload: err
                    });
                }
            });
    }
};

export const getLessonText = (courseUrl, lessonUrl) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_TEXT_REQUEST,
            payload: null
        });

        fetch("/api/lessons-text/" + courseUrl + '/' + lessonUrl, {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleTextData(data);

                dispatch({
                    type: GET_LESSON_TEXT_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                if (err.status === 404) {
                    dispatch({
                        type: SET_LESSON_TEXT_NOT_FOUND,
                        payload: null
                    });
                } else {
                    dispatch({
                        type: GET_LESSON_TEXT_FAIL,
                        payload: err
                    });
                }
            });
    }
}

export const updateLessonPositions = () => {

}

export const clearLessonPlayInfo = () => {
    return {
        type: CLEAR_LESSON_PLAY_INFO,
        payload: null
    }
}

export const startLessonPlaying = (lessonInfo) => {
    return (dispatch) => {
        dispatch({
            type: START_LESSON_PLAYING,
            payload: lessonInfo
        });
    }
}


const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        let error = new Error(response.statusText);
        error.status = response.status;
        error.response = response;
        throw error
    }
};

const parseJSON = (response) => {
    return response.json()
};

const handleData = (data) => {
    (CourseDiscounts.activateDiscount({course: data.Course}))
    let _lesson = data;

    _lesson.courseUrl = data.Course.URL;
    if (_lesson.ExtLinks) {
        _lesson.ExtLinks = JSON.parse(_lesson.ExtLinks)
    }

    let _parentNumber = _lesson.Number;
    _lesson.Childs.forEach((lesson) => {
        lesson.courseUrl = data.Course.URL;
        lesson.Number = _parentNumber + '.' + lesson.Number
    })

    if (_lesson.Books) {
        _lesson.Books.forEach((book) => {
            if (book.ExtLinks) {
                book.ExtLinks = JSON.parse(book.ExtLinks)
            }
        })
    }
};

const handleLessons = (data) => {
    try {
        data.Lessons.forEach((lesson) => {
            let _readyDate = lesson.ReadyDate ? new Date(lesson.ReadyDate) : null,
                _parsedDate = parseReadyDate(_readyDate);

            lesson.readyMonth = _parsedDate.readyMonth;
            lesson.readyYear = _parsedDate.readyYear;

            if (lesson.CoverMeta) {
                lesson.CoverMeta = JSON.parse(lesson.CoverMeta)
            }

            let _parentNumber = lesson.Number;
            lesson.Lessons.forEach((subLesson) => {
                subLesson.Number = _parentNumber + '.' + subLesson.Number
            })
        });
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};

const handleTextData = (data) => {
    try {
        data.Galery.forEach((lesson) => {
            if (lesson.MetaData) {
                lesson.MetaData = JSON.parse(lesson.MetaData)
            }
        });
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};
