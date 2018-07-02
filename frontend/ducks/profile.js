// import {all, takeEvery, take, put, apply, call} from 'redux-saga/effects'
// import {eventChannel} from 'redux-saga'
import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, Set, List} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {
    SIGN_IN_SUCCESS,
    LOGOUT_SUCCESS,
} from "../constants/user";

/**
 * Constants
 * */
export const moduleName = 'profile'
const prefix = `${appName}/${moduleName}`

export const GET_USER_INFO_REQUEST = `${prefix}/GET_USER_INFO_REQUEST`
export const GET_USER_INFO_SUCCESS = `${prefix}/GET_USER_INFO_SUCCESS`
export const GET_USER_INFO_ERROR = `${prefix}/GET_USER_INFO_ERROR`

export const GET_HISTORY_REQUEST = `${prefix}/GET_HISTORY_REQUEST`
export const GET_HISTORY_SUCCESS = `${prefix}/GET_HISTORY_SUCCESS`
export const GET_HISTORY_ERROR = `${prefix}/GET_HISTORY_ERROR`

export const CHANGE_PASSWORD_START = `${prefix}/CHANGE_PASSWORD_START`
export const CHANGE_PASSWORD_SUCCESS = `${prefix}/CHANGE_PASSWORD_SUCCESS`
export const CHANGE_PASSWORD_ERROR = `${prefix}/CHANGE_PASSWORD_ERROR`

export const GET_BOOKMARKS_START = `${prefix}/GET_BOOKMARKS_START`
export const GET_BOOKMARKS_SUCCESS = `${prefix}/GET_BOOKMARKS_SUCCESS`
export const GET_BOOKMARKS_ERROR = `${prefix}/GET_BOOKMARKS_ERROR`

export const GET_BOOKMARKS_EXT_START = `${prefix}/GET_BOOKMARKS_EXT_START`
export const GET_BOOKMARKS_EXT_SUCCESS = `${prefix}/GET_BOOKMARKS_EXT_SUCCESS`
export const GET_BOOKMARKS_EXT_ERROR = `${prefix}/GET_BOOKMARKS_EXT_ERROR`

export const ADD_COURSE_TO_BOOKMARKS_START = `${prefix}/ADD_COURSE_TO_BOOKMARKS_START`
export const ADD_COURSE_TO_BOOKMARKS_SUCCESS = `${prefix}/ADD_COURSE_TO_BOOKMARKS_SUCCESS`
export const ADD_COURSE_TO_BOOKMARKS_ERROR = `${prefix}/ADD_COURSE_TO_BOOKMARKS_ERROR`

export const REMOVE_COURSE_FROM_BOOKMARKS_START = `${prefix}/REMOVE_COURSE_FROM_BOOKMARKS_START`
export const REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS = `${prefix}/REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS`
export const REMOVE_COURSE_FROM_BOOKMARKS_ERROR = `${prefix}/REMOVE_COURSE_FROM_BOOKMARKS_ERROR`

export const ADD_LESSON_TO_BOOKMARKS_START = `${prefix}/ADD_LESSON_TO_BOOKMARKS_START`
export const ADD_LESSON_TO_BOOKMARKS_SUCCESS = `${prefix}/ADD_LESSON_TO_BOOKMARKS_SUCCESS`
export const ADD_LESSON_TO_BOOKMARKS_ERROR = `${prefix}/ADD_LESSON_TO_BOOKMARKS_ERROR`

export const REMOVE_LESSON_FROM_BOOKMARKS_START = `${prefix}/REMOVE_LESSON_FROM_BOOKMARKS_START`
export const REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS = `${prefix}/REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS`
export const REMOVE_LESSON_FROM_BOOKMARKS_ERROR = `${prefix}/REMOVE_LESSON_FROM_BOOKMARKS_ERROR`

export const CLEAR_ERROR = `${prefix}/CLEAR_ERROR`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    user: null,
    history: [],
    bookmarks: new Set(),
    courseBookmarks: new List(),
    lessonBookmarks: new List(),
    loading: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_USER_INFO_REQUEST:
            // case CHANGE_PASSWORD_START:
            // case GET_HISTORY_REQUEST:
            return state
                .set('error', null)
                .set('loading', true)

        case GET_USER_INFO_SUCCESS:
            return state
                .set('loading', false)
                .set('user', payload)

        case LOGOUT_SUCCESS:
            return state
                .clear()

        case GET_USER_INFO_ERROR:
        case GET_HISTORY_ERROR:
        case CHANGE_PASSWORD_ERROR:
            return state
                .set('loading', false)
                .set('error', payload.error.message)

        case GET_HISTORY_SUCCESS:
            return state
            // .set('loading', false)
                .set('history', payload)

        case CHANGE_PASSWORD_SUCCESS:
            return state
                .set('user', payload)
                .set('error', null)

        case CLEAR_ERROR:
            return state
                .set('error', null)

        case GET_BOOKMARKS_START:
            return state
                .set('error', null)
                // .set('loading', true)
                .update('bookmarks', bookmarks => bookmarks.clear())

        case GET_BOOKMARKS_EXT_START:
            return state
                .set('error', null)
                // .set('loading', true)
                .update('courseBookmarks', courseBookmarks => courseBookmarks.clear())
                .update('lessonBookmarks', lessonBookmarks => lessonBookmarks.clear())

        case GET_BOOKMARKS_EXT_SUCCESS:
            return state
                .set('error', null)
                .update('courseBookmarks', courseBookmarks => courseBookmarks.concat(payload.Courses))
                .update('lessonBookmarks', lessonBookmarks => lessonBookmarks.concat(payload.Lessons))

        case GET_BOOKMARKS_SUCCESS:
            return state
                .update('bookmarks', bookmarks => bookmarks.union(payload))

        case GET_BOOKMARKS_ERROR:
            return state
                .set('loading', false)
                .set('error', payload.error.message)

        case ADD_COURSE_TO_BOOKMARKS_SUCCESS:
        case ADD_LESSON_TO_BOOKMARKS_SUCCESS:
            return state
                .update('bookmarks', bookmarks => bookmarks.add(payload))

        case REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS:
            return state
                .update('bookmarks', bookmarks => bookmarks.delete(payload))
                // .update('courseBookmarks', courseBookmarks => {
                //     let _index = courseBookmarks.findIndex((course) => {
                //         return course.URL === payload
                //     })
                //
                //     return (_index >= 0) ?
                //         courseBookmarks.splice(_index, 1)
                //         :
                //         courseBookmarks
                //     })

        case REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS:
            return state
                .update('bookmarks', bookmarks => bookmarks.delete(payload.courseUrl + '/' + payload.lessonUrl))
                // .update('lessonBookmarks', lessonBookmarks => {
                //     let _index = lessonBookmarks.findIndex((lesson) => {
                //         return (lesson.URL === payload.lessonUrl) && (lesson.courseUrl === payload.courseUrl)
                //     })
                //
                //     return (_index >= 0) ?
                //         lessonBookmarks.splice(_index, 1)
                //         :
                //         lessonBookmarks
                // })

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const userSelector = createSelector(stateSelector, state => state.user)
export const userHistorySelector = createSelector(stateSelector, state => state.history)
export const userBookmarksSelector = createSelector(stateSelector, state => state.bookmarks)

export const getCourseBookmarks = createSelector(stateSelector, state => state.courseBookmarks)
export const getLessonBookmarks = createSelector(stateSelector, state => state.lessonBookmarks)

export const errorSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.loading)

/**
 * Action Creators
 * */

export function getUserProfile() {
    return (dispatch) => {
        dispatch({
            type: GET_USER_INFO_REQUEST,
            payload: null
        });

        fetch("/api/users", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleData(data);
                dispatch({
                    type: GET_USER_INFO_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_USER_INFO_ERROR,
                    payload: {error}
                });
            });
    }
}

export function getUserHistory() {
    return (dispatch) => {
        dispatch({
            type: GET_HISTORY_REQUEST,
            payload: null
        });

        fetch("/api/users/history", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleHistoryData(data);
                dispatch({
                    type: GET_HISTORY_SUCCESS,
                    payload: data.Lessons
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_HISTORY_ERROR,
                    payload: {error}
                });
            });
    }
}

export function getUserBookmarks() {
    return (dispatch) => {
        dispatch({
            type: GET_BOOKMARKS_START,
            payload: null
        });

        fetch("/api/users/bookmark", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: GET_BOOKMARKS_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_BOOKMARKS_ERROR,
                    payload: {error}
                });
            });
    }
}

export function getUserBookmarksFull() {
    return (dispatch) => {
        dispatch({
            type: GET_BOOKMARKS_EXT_START,
            payload: null
        });

        fetch("/api/users/bookmark-ext", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleBookmarksData(data);

                dispatch({
                    type: GET_BOOKMARKS_EXT_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_BOOKMARKS_EXT_ERROR,
                    payload: {error}
                });
            });
    }
}

export function addCourseToBookmarks(url) {
    return (dispatch) => {
        dispatch({
            type: ADD_COURSE_TO_BOOKMARKS_START,
            payload: null
        });

        fetch("/api/users/bookmark/" + url, {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: ADD_COURSE_TO_BOOKMARKS_SUCCESS,
                    payload: url
                });
            })
            .catch((error) => {
                dispatch({
                    type: ADD_COURSE_TO_BOOKMARKS_ERROR,
                    payload: {error}
                });
            });
    }
}

export function addLessonToBookmarks(courseUrl, lessonUrl) {
    return (dispatch) => {
        dispatch({
            type: ADD_LESSON_TO_BOOKMARKS_START,
            payload: null
        });

        fetch("/api/users/bookmark/" + courseUrl + '/' + lessonUrl, {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: ADD_LESSON_TO_BOOKMARKS_SUCCESS,
                    payload: courseUrl + '/' + lessonUrl
                });
            })
            .catch((error) => {
                dispatch({
                    type: ADD_LESSON_TO_BOOKMARKS_ERROR,
                    payload: {error}
                });
            });
    }
}

export function removeCourseFromBookmarks(url) {
    return (dispatch) => {
        dispatch({
            type: REMOVE_COURSE_FROM_BOOKMARKS_START,
            payload: null
        });

        fetch("/api/users/bookmark/" + url, {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json"
            },
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS,
                    payload: url
                });
            })
            .catch((error) => {
                dispatch({
                    type: REMOVE_COURSE_FROM_BOOKMARKS_ERROR,
                    payload: {error}
                });
            });
    }
}

export function removeLessonFromBookmarks(courseUrl, lessonUrl) {
    return (dispatch) => {
        dispatch({
            type: REMOVE_LESSON_FROM_BOOKMARKS_START,
            payload: null
        });

        fetch("/api/users/bookmark/" + courseUrl + '/' + lessonUrl, {
            method: 'DELETE',
            headers: {
                "Content-type": "application/json"
            },
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS,
                    payload: {courseUrl: courseUrl, lessonUrl: lessonUrl}
                });
            })
            .catch((error) => {
                dispatch({
                    type: REMOVE_LESSON_FROM_BOOKMARKS_ERROR,
                    payload: {error}
                });
            });
    }
}

export const changePassword = (values) => {
    return (dispatch) => {
        dispatch({
            type: CHANGE_PASSWORD_START,
            payload: null
        });

        fetch("api/users", {
            method: 'PUT',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(values),
            credentials: 'include'
        })
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: CHANGE_PASSWORD_SUCCESS,
                    payload: data
                });

                dispatch({
                    type: SIGN_IN_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: CHANGE_PASSWORD_ERROR,
                    payload: {error}
                });
            });
    }
}

export const clearError = () => {
    return {
        type: CLEAR_ERROR,
        payload: null
    };
}

const handleData = (data) => {
    if (data.Courses) {
        data.Courses.forEach(course => handleCourse(course))
    }

    if (data.Lessons) {
        data.Lessons.forEach((lesson) => {
            handleLesson(lesson);

            let _course = data.Courses.find((course) => {
                return course.Id === lesson.CourseId
            })

            lesson.courseUrl = _course ? _course.URL : null;
        })
    }

    if (data.PortraitMeta) {
        data.PortraitMeta = JSON.parse(data.PortraitMeta)
    }
}

const handleCourse = (data) => {
    if (data.CoverMeta) {
        data.CoverMeta = JSON.parse(data.CoverMeta)
    }
};

const handleLesson = (lesson) => {
    let _readyDate = new Date(lesson.ReadyDate);
    lesson.readyYear = _readyDate.getFullYear();
    lesson.readyMonth = Months[_readyDate.getMonth()];

    if (lesson.CoverMeta) {
        lesson.CoverMeta = JSON.parse(lesson.CoverMeta)
    }

    if (lesson.Lessons) {
        let _parentNumber = lesson.Number;
        lesson.Lessons.forEach((subLesson) => {
            subLesson.Number = _parentNumber + '.' + subLesson.Number
        })
    }
};

const handleHistoryData = (data) => {
    if (data.Lessons) {
        data.Lessons.forEach((lesson) => {
            handleLesson(lesson);

            let _lastVisitDate = new Date(lesson.LastVisit),
                _year = _lastVisitDate.getFullYear(),
                _month = Months[_lastVisitDate.getMonth()],
                _day = _lastVisitDate.getDate(),
                _hours = _lastVisitDate.getHours(),
                _minutes = _lastVisitDate.getMinutes();

            let _today = new Date(),
                _todayYear = _today.getFullYear(),
                _todayMonth = Months[_today.getMonth()],
                _todayDay = _today.getDate();

            let _isLastVisitToday = (_year === _todayYear) && (_month === _todayMonth) && (_day === _todayDay);

            lesson.lastVisitDate = _lastVisitDate;
            lesson.lastVisitDay = _isLastVisitToday ? "Сегодня" : _day + ' ' + _month + ' ' + _year;
            lesson.lastVisitTime = _hours + ':' + _minutes;

            let _course = data.Courses[lesson.CourseId];

            lesson.courseUrl = _course ? _course.URL : null;
            lesson.courseName = _course ? _course.Name : null;

            let _author = data.Authors[lesson.AuthorId];

            lesson.authorUrl = _author ? _author.URL : null;
            lesson.authorName = _author ? _author.FirstName + ' ' + _author.LastName : null;
        })

        data.Lessons.sort((a, b) => {
            return (b.lastVisitDate.getTime() - a.lastVisitDate.getTime());
        })
    }
}

const handleBookmarksData = (data) => {
    if (data.Courses) {
        data.Courses.forEach(course => {
            handleCourse(course)
            course.authors = [];

            course.Authors.forEach((authorId) => {
                course.authors.push(data.Authors[authorId])
            })

            course.categories = [];

            course.Categories.forEach((categoryId) => {
                course.categories.push(data.Categories[categoryId])
            })
        })
    }

    if (data.Lessons) {
        data.Lessons.forEach((lesson) => {
            handleLesson(lesson);

            let _course = data.LessonCourses[lesson.CourseId];

            lesson.courseUrl = _course ? _course.URL : null;
            lesson.courseName = _course ? _course.Name : null;

            let _author = data.Authors[lesson.AuthorId];

            lesson.authorUrl = _author ? _author.URL : null;
            lesson.authorName = _author ? _author.FirstName + ' ' + _author.LastName : null;
        })

        data.Lessons.sort((a, b) => {
            let _result = b.CourseId - a.CourseId;

            if (_result === 0) {
                _result = a.Number - b.Number
            }

            return _result
        })
    }
}

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