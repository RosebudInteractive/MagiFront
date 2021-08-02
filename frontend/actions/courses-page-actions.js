import {
    CLEAN_COURSE_TIMELINES,
    GET_COURSES_FAIL,
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    SET_COURSE_NOT_FOUND,
    SET_COURSE_TIMELINES,
} from '../constants/courses'

import {LOAD_FILTER_VALUES,} from '../constants/filters'

import 'whatwg-fetch';
import {parseReadyDate} from "../tools/time-tools";
import {LESSON_STATE, TEST_TYPE} from "../constants/common-consts";

import {checkStatus, parseJSON} from "tools/fetch-tools";
import CourseDiscounts from "tools/course-discount";
import $ from 'jquery'

const _getColor = () => { //todo check it hot it used if imported as import commonTools from "../../team-task/tools/common";
    return "hsl(" + 360 * Math.random() + ',' +
        (55 + 45 * Math.random()) + '%,' +
        (50 + 10 * Math.random()) + '%)'
};


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

        const params = $.param(options);

        const _fetchUrl = "/api/courses/" + url + '?' + params;

        return fetch(_fetchUrl, {method: 'GET', credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => ({...data, Timelines: _mapTimelines(data.Timelines)}))
            .then(data => {
                handleCourse(data, getState());

                dispatch({
                    type: CLEAN_COURSE_TIMELINES,
                    payload: data
                });

                dispatch({
                    type: GET_SINGLE_COURSE_SUCCESS,
                    payload: data
                });

                dispatch({
                    type: SET_COURSE_TIMELINES,
                    payload: data.Timelines
                })
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
    } catch (err) {
        console.error('ERR: ' + err.message);
    }
};



const handleCourse = (data, state,) => {

    (CourseDiscounts.activateDiscount({course: data}));

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
    } catch (err) {
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
            item.Lessons.forEach((subitem) => {
                _duration += subitem.Duration
            })
        }
    })

    let _allPublished = course.Lessons.length === _published

    _duration = !_allPublished && course.EstDuration && (course.EstDuration > _duration) ?
        course.EstDuration
        :
        _duration

    // _duration = new Date(_duration * 1000)
    const _durationHours = Math.trunc(_duration / (60 * 60)),
        _durationMinutes = Math.trunc((_duration - (_durationHours * 60 * 60)) / 60)

    let {lesson: lastListened, hasListened} = getLastListenedLesson(course.Lessons, state)

    course.statistics.lessons = {
        total: course.Lessons.length,
        sublessonsCount: _sublessonsCount,
        published: _published,
        allPublished: _allPublished,
        readyDate: _allPublished ? null : parseReadyDate(_maxReadyDate),
        duration: {hours: _durationHours, minutes: _durationMinutes},
        finishedLessons: _finishedLessons,
        lastListened: lastListened,
        hasListened: !!hasListened,
        freeLesson: course.Lessons.find((item) => {
            return item.IsFreeInPaidCourse
        })
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
                    return acc + (value.Instance.Score > value.Instance.MaxScore ? 0 : value.Instance.Score / value.Instance.MaxScore)
                }, 0) / _completed
            :
            0

    course.statistics.tests = {total: _total, completed: _completed, percent: Math.round(_percent * 100)}
}

const _mapTimelines = (dataToMap) => {
    const mappedData = dataToMap.map(tm => ({
        ...tm,
        CourseId: tm.Course ? tm.Course.Id : null,
        LessonId: tm.Lesson ? tm.Lesson.Id : null,
        Events: tm.Events.map(ev => ({
            ...ev,
            id: ev.Id,
            year: ev.Year ? ev.Year : new Date(ev.Date).getFullYear(),
            month: ev.Month ? ev.Month : new Date(ev.Date).getMonth() + 1,
            name: ev.Name,
            color: _getColor(),
            date: ev.Date ? new Date(ev.Date).toLocaleDateString("ru-Ru") : `${ev.Month ? ev.Month + '.' : ''}${ev.Year}`,
            visible: true,
            DisplayDate: ev.Date ?
                new Date(ev.Date).toLocaleDateString("ru-Ru") :
                `${ev.DayNumber ? ev.DayNumber.toString().padStart(2, '0') + '.' : ''}${ev.Month ? ev.Month.toString().padStart(2, '0') + '.' : ''}${ev.Year}`,
            DayNumber: ev.Date ? new Date(ev.Date).getDate() : ev.DayNumber ? ev.DayNumber : null, //а это дата для  отображения только дня
            Month: ev.Month ? ev.Month : ev.Date ? new Date(ev.Date).getMonth() + 1 : null,
            Year: ev.Year ? ev.Year : ev.Date ? new Date(ev.Date).getFullYear() : null
        })),

        Periods: tm.Periods.map(pr => ({
            ...pr,
            StartYear: pr.StartYear ? pr.StartYear :
                pr.LbYear ? pr.LbYear :
                    new Date(pr.LbDate).getFullYear(),

            StartMonth: pr.StartMonth ? pr.StartMonth :
                pr.LbMonth ? pr.LbMonth :
                    new Date(pr.LbDate).getMonth() + 1,
            StartDay: pr.StartDay ? pr.StartDay : new Date(pr.LbDate).getDate(),

            EndYear: pr.EndYear ? pr.EndYear :
                pr.RbYear ? pr.RbYear :
                    new Date(pr.RbDate).getFullYear(),

            EndMonth: pr.EndMonth ? pr.EndMonth :
                pr.RbMonth ? pr.RbMonth :
                    new Date(pr.RbDate).getMonth() + 1,
            EndDay: pr.EndDay ? pr.EndDay : new Date(pr.RbDate).getDate(),

            startDate: pr.StartDate ?
                new Date(pr.StartDate).toLocaleDateString("ru-Ru") :
                pr.LbDate ? new Date(pr.LbDate).toLocaleDateString("ru-Ru") :
                    `${pr.LbMonth ? pr.LbMonth + '.' : ''}${pr.LbYear}`,
            endDate: pr.EndDate ? new Date(pr.EndDate).toLocaleDateString("ru-Ru") :
                pr.RbDate ? new Date(pr.RbDate).toLocaleDateString("ru-Ru") :
                    `${pr.RbMonth ? pr.RbMonth + '.' : ''}${pr.RbYear}`,
            color: _getColor(),
            visible: true,

            DisplayStartDate:
                pr.LbDate ? new Date(pr.LbDate).toLocaleDateString("ru-Ru") :
                    pr.StartDate ? new Date(pr.StartDate).toLocaleDateString("ru-Ru") :
                        `${pr.StartDay ? pr.StartDay.toString().padStart(2, '0') + '.' : ''}${pr.StartMonth ? pr.StartMonth.toString().padStart(2, '0') + '.' : ''}${pr.StartYear}`,

            DisplayEndDate: pr.RbDate ? new Date(pr.RbDate).toLocaleDateString("ru-Ru") :
                pr.EndDate ? new Date(pr.EndDate).toLocaleDateString("ru-Ru") :
                    `${pr.EndDay ? pr.EndDay.toString().padStart(2, '0') + '.' : ''}${pr.EndMonth ? pr.EndMonth.toString().padStart(2, '0') + '.' : ''}${pr.EndYear}`,
        }))
    }));
    return mappedData;
};
