import {
    GET_LESSON_REQUEST,
    GET_LESSON_SUCCESS,
    GET_LESSON_FAIL,
    GET_LESSONS_ALL_REQUEST,
    GET_LESSONS_ALL_SUCCESS,
    GET_LESSONS_ALL_FAIL,
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

        fetch("/api/lessons/v2/" + courseUrl + '/' + lessonUrl, {credentials: 'include'})
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

export const getLessonsAll = (courseUrl, lessonUrl) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSONS_ALL_REQUEST,
            payload: null
        });

        fetch("/api/lessons-all/" + courseUrl + '/' + lessonUrl, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleLessons(data);

                dispatch({
                    type: GET_LESSONS_ALL_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_LESSONS_ALL_FAIL,
                    payload: err
                });
            });
    }
}

export const getLessonText = (courseUrl, lessonUrl) => {
    return (dispatch) => {
        dispatch({
            type: GET_LESSON_TEXT_REQUEST,
            payload: null
        });

        fetch("/api/lessons-text/" + courseUrl + '/' + lessonUrl, {credentials: 'include'})
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
    let _lesson = data;
    _lesson.courseUrl = data.Course.URL;
    let _parentNumber = _lesson.Number;
    _lesson.Childs.forEach((lesson) => {
        lesson.courseUrl = data.Course.URL;
        lesson.Number = _parentNumber + '.' + lesson.Number
    })
};

const handleLessons = (data) => {
    try {
        data.Lessons.forEach((lesson) => {
            let _readyDate = new Date(lesson.ReadyDate);
            lesson.readyYear = _readyDate.getFullYear();
            lesson.readyMonth = Months[_readyDate.getMonth()];

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

const Months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];