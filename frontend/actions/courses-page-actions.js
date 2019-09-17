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
import {getTimeFmt, parseReadyDate} from "../tools/time-tools";
import {LESSON_STATE} from "../constants/common-consts";

export const getCourses = () => {
    return (dispatch) => {
        dispatch({
            type: GET_COURSES_REQUEST,
            payload: null
        });

        fetch("/api/courses", {method: 'GET', credentials: 'include'})
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
    return (dispatch, getState) => {
        dispatch({
            type: GET_SINGLE_COURSE_REQUEST,
            payload: null
        });

        fetch("/api/courses/" + url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleCourse(data, getState());

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

const handleCourse = (data, state) => {
    try {
        if (data.CoverMeta) {
            data.CoverMeta = JSON.parse(data.CoverMeta)
        }

        if (data.ExtLinks) {
            data.ExtLinks = JSON.parse(data.ExtLinks)
        }

        data.Mask = data.Mask ? data.Mask : '_mask01';

        data.Authors.forEach((author) => {
            if (author.PortraitMeta) {
                author.PortraitMeta = JSON.parse(author.PortraitMeta)
            }
        });

        if (data.Books) {
            data.Books.forEach((book) => {
                if (book.ExtLinks) {
                    book.ExtLinks = JSON.parse(book.ExtLinks)
                }
            })
        }

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

            let _readyDate = lesson.ReadyDate ? new Date(lesson.ReadyDate) : null,
                _parsedDate = parseReadyDate(_readyDate);

            lesson.readyMonth = _parsedDate.readyMonth;
            lesson.readyYear = _parsedDate.readyYear;
        });

        data.lessonCount = _lessonCount;
        data.readyLessonCount = _readyLessonCount;

        calcStatistics(data, state)
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};

const calcStatistics = (course, state) => {
    course.statistics = {}

    if (!course) return

    let _published = 0,
        _maxReadyDate = 0,
        _sublessonsCount = 0,
        _duration = 0,
        _finishedLessons = 0

    course.Lessons.forEach((item) => {
        if (item.State === LESSON_STATE.READY) _published++

        let _readyDate = item.ReadyDate ? new Date(item.ReadyDate) : 0
        _maxReadyDate = (_readyDate > _maxReadyDate) ? _readyDate : _maxReadyDate

        _duration += item.Duration

        if (item.IsFinished) _finishedLessons++

        if (item.Lessons.length > 0) {
            _sublessonsCount += item.Lessons.length
            item.Lessons.forEach((subitem) => { _duration += subitem.Duration })
        }
    })

    let _allPublished = course.Lessons.length === _published

    _duration = !_allPublished && course.EstDuration && (course.EstDuration > _duration) ?
            course.EstDuration
            :
            _duration

    _duration = new Date(_duration * 1000)

    let _lastListened = getLastListenedLesson(course.Lessons, state)

    course.statistics.lessons = {
        total: course.Lessons.length,
        sublessonsCount: _sublessonsCount,
        published: _published,
        allPublished : _allPublished,
        readyDate: _allPublished ? null : parseReadyDate(_maxReadyDate),
        duration: {hours: _duration.getUTCHours().toString(), minutes: _duration.getUTCMinutes().toString()},
        finishedLessons: _finishedLessons,
        lastListened: _lastListened
    }
}

const getLastListenedLesson = (lessons, state) => {
    let _lessonInStorage = state.lessonInfoStorage.lessons

    let _lesson = lessons
        .map((item, index) => {
            return {info: _lessonInStorage.get(item.Id), id: item.Id, index: index}
        })
        .reduce((acc, curr) => {
            return acc.info && curr.info ?
                ((acc.info.ts < curr.info.ts) && !acc.info.isFinished && !curr.info.isFinished) || (acc.info.isFinished && !curr.info.isFinished) ? curr : acc
                :
                curr.info ? curr : acc
    })

    return lessons[_lesson.index]
}