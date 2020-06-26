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
import {parseReadyDate} from "../tools/time-tools";
import {DATA_EXPIRATION_TIME, LESSON_STATE, TEST_TYPE} from "../constants/common-consts";

import {checkStatus, parseJSON} from "tools/fetch-tools";
import CourseDiscounts from "tools/course-discount";


export const getCourses = () => {
    return (dispatch, getState) => {
        // const _state = getState().courses

        // if (!!_state.lastSuccessTime && ((Date.now() - _state.lastSuccessTime) < DATA_EXPIRATION_TIME)) {
        //     return
        // }

        dispatch({
            type: GET_COURSES_REQUEST,
            payload: null
        });

        fetch("/api/courses", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleCourses(data, getState());

                dispatch({
                    type: GET_COURSES_SUCCESS,
                    payload: {...data, time: Date.now()}
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

export const getCourse = (url, options) => {
    return (dispatch, getState) => {
        dispatch({
            type: GET_SINGLE_COURSE_REQUEST,
            payload: null
        });

        const _fetchUrl = "/api/courses/" + url + (options && options.absPath ? "?abs_path=true" : "")

        return fetch(_fetchUrl, {method: 'GET', credentials: 'include'})
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

const handleCourses = (data, state) => {
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

            calcStatistics(item, state)
        });
    }
    catch (err) {
        console.error('ERR: ' + err.message);
    }
};

const handleCourse = (data, state,) => {
    (CourseDiscounts.activateDiscount({course: data}))

    try {
        if (data.CoverMeta && (typeof data.CoverMeta === "string")) {
            data.CoverMeta = JSON.parse(data.CoverMeta)
        }

        if (data.LandCoverMeta && (typeof data.LandCoverMeta === "string")) {
            data.LandCoverMeta = JSON.parse(data.LandCoverMeta)
        }

        if (data.ExtLinks && (typeof data.ExtLinks === "string")) {
            data.ExtLinks = JSON.parse(data.ExtLinks)
        }

        data.Mask = data.Mask ? data.Mask : '_mask01';

        data.Authors.forEach((author) => {
            if (author.PortraitMeta && (typeof author.PortraitMeta === "string")) {
                author.PortraitMeta = JSON.parse(author.PortraitMeta)
            }
        });

        if (data.Books) {
            data.Books.forEach((book) => {
                if (book.ExtLinks && (typeof book.ExtLinks === "string")) {
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

            if (lesson.CoverMeta && (typeof lesson.CoverMeta === "string")) {
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
        calcTestsData(data)
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

        if (item.Lessons && item.Lessons.length > 0) {
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

    let {lesson: lastListened, hasListened} = getLastListenedLesson(course.Lessons, state)

    course.statistics.lessons = {
        total: course.Lessons.length,
        sublessonsCount: _sublessonsCount,
        published: _published,
        allPublished : _allPublished,
        readyDate: _allPublished ? null : parseReadyDate(_maxReadyDate),
        duration: {hours: _duration.getUTCHours().toString(), minutes: _duration.getUTCMinutes().toString()},
        finishedLessons: _finishedLessons,
        lastListened: lastListened,
        hasListened: !!hasListened,
        freeLesson: course.Lessons.find((item) => {return item.IsFreeInPaidCourse})
    }

}

const getLastListenedLesson = (lessons, state) => {
    if (!state.lessonInfoStorage) {
        return {lesson: null, hasListened: false}
    }

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

    return {lesson: lessons[_lesson.index], hasListened: (_lesson.index !== 0) || (_lesson.info && _lesson.info.ts)}
}

const calcTestsData = (course) => {
    if (!course.statistics) {
        course.statistics = {}
    }

    let _tests = []

    course.Tests.forEach((item) => {
        if ((item.TestTypeId === TEST_TYPE.STARTED) || (item.TestTypeId === TEST_TYPE.FINISHED)) {
            _tests.push(item)
        }
    })

    course.Lessons.forEach((lesson) => {
        if (lesson.Tests) {
            lesson.Tests.forEach((item) => {
                if ((item.TestTypeId === TEST_TYPE.STARTED) || (item.TestTypeId === TEST_TYPE.FINISHED)) {
                    _tests.push(item)
                }
            })
        }
    })

    let _total = _tests.length,
        _completed = _tests.filter(item => item.Instance && item.Instance.IsFinished).length,
        _percent = _completed ?
            _tests
                .filter(item => item.Instance && item.Instance.IsFinished)
                .reduce((acc, value) => {
                    return acc + (value.Instance.Score > value.Instance.MaxScore ? 0 :  value.Instance.Score / value.Instance.MaxScore)
                }, 0) / _completed
            :
            0

    course.statistics.tests = {total: _total, completed: _completed, percent: Math.round(_percent * 100)}
}
