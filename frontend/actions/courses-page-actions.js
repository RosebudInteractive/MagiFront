import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL, SET_COURSE_NOT_FOUND,
} from '../constants/courses'

import {
    LOAD_FILTER_VALUES,
} from '../constants/filters'

import 'whatwg-fetch';
import {getMonthBetween, getSeason, getSeasonBetween} from "../tools/time-tools";

export const getCourses = () => {
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
            });
    }
};

export const getCourse = (url) => {
    return (dispatch) => {
        dispatch({
            type: GET_SINGLE_COURSE_REQUEST,
            payload: null
        });

        fetch("/api/courses/" + url, {credentials: 'include'})
        .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleCourse(data);

                dispatch({
                    type: GET_SINGLE_COURSE_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                if (err.status === 404) {
                    dispatch({
                        type: SET_COURSE_NOT_FOUND,
                        payload: null
                    });
                } else {
                    dispatch({
                        type: GET_SINGLE_COURSE_FAIL,
                        payload: err
                    });
                }
            });

    }
};

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
    try {
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

            item.Mask = item.Mask ? item.Mask : '_mask01';

            let _readyLessonCount = 0;

            item.Lessons.forEach((lesson) => {
                if (lesson.CoverMeta) {
                    lesson.CoverMeta = JSON.parse(lesson.CoverMeta)
                }

                if (lesson.State === 'R') {
                    _readyLessonCount++
                }
            });

            item.readyLessonCount = _readyLessonCount;

            if (item.CoverMeta) {
                item.CoverMeta = JSON.parse(item.CoverMeta)
            }
        });
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};

const handleCourse = (data) => {
    try {
        if (data.CoverMeta) {
            data.CoverMeta = JSON.parse(data.CoverMeta)
        }

        data.Mask = data.Mask ? data.Mask : '_mask01';

        data.Authors.forEach((author) => {
            if (author.PortraitMeta) {
                author.PortraitMeta = JSON.parse(author.PortraitMeta)
            }
        });

        let _lessonCount = 0,
            _readyLessonCount = 0;

        data.Lessons.forEach((lesson) => {
            if (lesson.State === 'R') {
                _lessonCount++;
                _readyLessonCount++
            } else {
                _lessonCount++
            }

            if (lesson.CoverMeta) {
                lesson.CoverMeta = JSON.parse(lesson.CoverMeta)
            }

            let _readyDate = lesson.ReadyDate ? new Date(lesson.ReadyDate) : null;
            if (_readyDate) {
                let _now = new Date(),
                    _monthDelta = getMonthBetween(_now, _readyDate);

                lesson.readyYear = _readyDate.getFullYear();

                if (_monthDelta > 9) {
                    lesson.readyMonth = '';
                } else {
                    if (getSeasonBetween(_now, _readyDate) > 1) {
                        lesson.readyMonth = getSeason(_readyDate);
                        if (_readyDate.getMonth() === 11) {
                            lesson.readyYear++
                        }
                    } else {
                        lesson.readyMonth = Months[_readyDate.getMonth()];
                    }
                }
            } else {
                lesson.readyYear = ''
                lesson.readyMonth = ''
            }
        });

        data.lessonCount = _lessonCount;
        data.readyLessonCount = _readyLessonCount;
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