// import {all, takeEvery, take, put, apply, call} from 'redux-saga/effects'
// import {eventChannel} from 'redux-saga'
import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, Set, List,} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, mockFetch, parseJSON} from "../tools/fetch-tools";
import {
    SIGN_IN_SUCCESS,
    LOGOUT_SUCCESS,
} from "../constants/user";
import {parseReadyDate} from "../tools/time-tools";
import {all, takeEvery, select, take, put, apply, call, fork} from 'redux-saga/effects'
import {SEND_PAYMENT_SUCCESS} from "ducks/billing";
import {SHOW_MODAL_MESSAGE_ERROR} from "ducks/message";

/**
 * Constants
 * */
export const moduleName = 'profile'
const prefix = `${appName}/${moduleName}`

export const GET_USER_INFO_REQUEST = `${prefix}/GET_USER_INFO_REQUEST`
export const GET_USER_INFO_START = `${prefix}/GET_USER_INFO_START`
export const GET_USER_INFO_SUCCESS = `${prefix}/GET_USER_INFO_SUCCESS`
export const GET_USER_INFO_ERROR = `${prefix}/GET_USER_INFO_ERROR`

export const GET_USER_PAID_COURSES_REQUEST = `${prefix}/GET_USER_PAID_COURSES_REQUEST`
export const GET_USER_PAID_COURSES_START = `${prefix}/GET_USER_PAID_COURSES_START`
export const GET_USER_PAID_COURSES_SUCCESS = `${prefix}/GET_USER_PAID_COURSES_SUCCESS`
export const GET_USER_PAID_COURSES_FAIL = `${prefix}/GET_USER_PAID_COURSES_FAIL`

export const GET_USER_PAID_COURSES_EXT_REQUEST = `${prefix}/GET_USER_PAID_COURSES_EXT_REQUEST`
export const GET_USER_PAID_COURSES_EXT_START = `${prefix}/GET_USER_PAID_COURSES_EXT_START`
export const GET_USER_PAID_COURSES_EXT_SUCCESS = `${prefix}/GET_USER_PAID_COURSES_EXT_SUCCESS`
export const GET_USER_PAID_COURSES_EXT_FAIL = `${prefix}/GET_USER_PAID_COURSES_EXT_FAIL`

export const GET_HISTORY_REQUEST = `${prefix}/GET_HISTORY_REQUEST`
export const GET_HISTORY_SUCCESS = `${prefix}/GET_HISTORY_SUCCESS`
export const GET_HISTORY_ERROR = `${prefix}/GET_HISTORY_ERROR`

export const CHANGE_PASSWORD_START = `${prefix}/CHANGE_PASSWORD_START`
export const CHANGE_PASSWORD_SUCCESS = `${prefix}/CHANGE_PASSWORD_SUCCESS`
export const CHANGE_PASSWORD_ERROR = `${prefix}/CHANGE_PASSWORD_ERROR`

export const GET_BOOKMARKS_REQUEST = `${prefix}/GET_BOOKMARKS_REQUEST`
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

export const GET_TRANSACTIONS_REQUEST = `${prefix}/GET_TRANSACTIONS_REQUEST`
export const GET_TRANSACTIONS_START = `${prefix}/GET_TRANSACTIONS_START`
export const GET_TRANSACTIONS_SUCCESS = `${prefix}/GET_TRANSACTIONS_SUCCESS`
export const GET_TRANSACTIONS_ERROR = `${prefix}/GET_TRANSACTIONS_ERROR`

export const GET_SUBS_INFO_REQUEST = `${prefix}/GET_SUBS_INFO_REQUEST`
export const GET_SUBS_INFO_START = `${prefix}/GET_SUBS_INFO_START`
export const GET_SUBS_INFO_SUCCESS = `${prefix}/GET_SUBS_INFO_SUCCESS`
export const GET_SUBS_INFO_ERROR = `${prefix}/GET_SUBS_INFO_ERROR`

export const SWITCH_AUTOPAY_START = `${prefix}/SWITCH_AUTOPAY_START`
export const SWITCH_AUTOPAY_SUCCESS = `${prefix}/SWITCH_AUTOPAY_SUCCESS`
export const SWITCH_AUTOPAY_ERROR = `${prefix}/SWITCH_AUTOPAY_ERROR`

export const CLEAR_STORED_CARD_REQUEST = `${prefix}/CLEAR_STORED_CARD_REQUEST`
export const CLEAR_STORED_CARD_START = `${prefix}/CLEAR_STORED_CARD_START`
export const CLEAR_STORED_CARD_SUCCESS = `${prefix}/CLEAR_STORED_CARD_SUCCESS`
export const CLEAR_STORED_CARD_FAIL = `${prefix}/CLEAR_STORED_CARD_FAIL`

export const CLEAR_ERROR = `${prefix}/CLEAR_ERROR`
export const FINISH_LOAD_PROFILE = `${prefix}/FINISH_LOAD_PROFILE`

/**
 * Reducer
 * */
const SubscriptionInfo = Record({
    Id: null,
    Payment: null,
    SubsAutoPayId: null,
    SubsAutoPay: false,
    SubsExpDate: null,
    Error: null,
})

export const ReducerRecord = Record({
    user: null,
    history: [],
    transactions: new List(),
    bookmarks: new Set(),
    paidCourses: new Set(),
    courseBookmarks: new List(),
    lessonBookmarks: new List(),
    paidCoursesInfo: new List(),
    subsInfo: new SubscriptionInfo(),
    loading: false,
    loadingSubsInfo: false,
    loadingBookmarks: false,
    loadingUserBookmarks: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_USER_INFO_START:
        case GET_HISTORY_REQUEST:
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
        case GET_TRANSACTIONS_ERROR:
        case CHANGE_PASSWORD_ERROR:
        case GET_USER_PAID_COURSES_FAIL:
        case GET_USER_PAID_COURSES_EXT_FAIL:
            return state
                .set('loading', false)
                .set('error', payload.error.message)

        case GET_HISTORY_SUCCESS:
            return state
                .set('loading', false)
                .set('history', payload)

        case CHANGE_PASSWORD_SUCCESS:
            return state
                .set('user', payload)
                .set('error', null)

        case CLEAR_ERROR:
            return state
                .set('error', null)

        case GET_USER_PAID_COURSES_START:
            return state
                .set('error', null)
                .set('loading', true)
                .update('paidCourses', paidCourses => paidCourses.clear())

        case GET_USER_PAID_COURSES_SUCCESS:
            return state
                .set('loading', false)
                .update('paidCourses', paidCourses => paidCourses.union(payload))

        case GET_USER_PAID_COURSES_EXT_START :
            return state
                .set('error', null)
                .set('loading', true)
                .update('paidCoursesInfo', paidCoursesInfo => paidCoursesInfo.clear())

        case GET_USER_PAID_COURSES_EXT_SUCCESS:
            return state
                .set('error', null)
                .set('loading', false)
                .update('paidCoursesInfo', paidCoursesInfo => paidCoursesInfo.concat(payload))

        case GET_BOOKMARKS_START:
            return state
                .set('error', null)
                .set('loadingUserBookmarks', true)
                .update('bookmarks', bookmarks => bookmarks.clear())

        case GET_BOOKMARKS_EXT_START:
            return state
                .set('error', null)
                .set('loadingBookmarks', true)
                .update('courseBookmarks', courseBookmarks => courseBookmarks.clear())
                .update('lessonBookmarks', lessonBookmarks => lessonBookmarks.clear())

        case GET_BOOKMARKS_EXT_SUCCESS:
            return state
                .set('error', null)
                .set('loadingBookmarks', false)
                .update('courseBookmarks', courseBookmarks => courseBookmarks.concat(payload.Courses))
                .update('lessonBookmarks', lessonBookmarks => lessonBookmarks.concat(payload.Lessons))

        case GET_BOOKMARKS_SUCCESS:
            return state
                .set('loadingUserBookmarks', false)
                .update('bookmarks', bookmarks => bookmarks.union(payload))

        case GET_BOOKMARKS_ERROR:
            return state
                .set('loadingUserBookmarks', false)
                .set('error', payload.error.message)

        case GET_BOOKMARKS_EXT_ERROR:
            return state
                .set('loadingBookmarks', false)
                .set('error', payload.error.message)

        case ADD_COURSE_TO_BOOKMARKS_SUCCESS:
        case ADD_LESSON_TO_BOOKMARKS_SUCCESS:
            return state
                .update('bookmarks', bookmarks => bookmarks.add(payload))

        case REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS:
            return state
                .update('bookmarks', bookmarks => bookmarks.delete(payload))

        case REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS:
            return state
                .update('bookmarks', bookmarks => bookmarks.delete(payload.courseUrl + '/' + payload.lessonUrl))

        case GET_TRANSACTIONS_START:
            return state
                .set('error', null)
                .set('loading', true)
                .update('transactions', transactions => transactions.clear())

        case GET_TRANSACTIONS_SUCCESS:
            return state
                .set('loading', false)
                .update('transactions', transactions => transactions.concat(payload))

        case GET_SUBS_INFO_START:
            return state
                .set('loadingSubsInfo', true)
                .update('subsInfo', subsInfo => subsInfo.clear())

        case GET_SUBS_INFO_SUCCESS:
            return state
                .update('subsInfo', subsInfo => subsInfo.merge(payload))
                .set('loadingSubsInfo', false)

        case GET_SUBS_INFO_ERROR:
            return state
                .set('loadingSubsInfo', false)
                .set('error', payload.error.message)

        case SWITCH_AUTOPAY_SUCCESS:
            return state
                .setIn(['subsInfo', 'SubsAutoPay'], payload)

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
export const userPaidCoursesSelector = createSelector(stateSelector, state => state.paidCourses)

export const getCourseBookmarks = createSelector(stateSelector, state => state.courseBookmarks)
export const getLessonBookmarks = createSelector(stateSelector, state => state.lessonBookmarks)

export const errorSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadingBookmarksSelector = createSelector(stateSelector, state => state.loadingBookmarks)
export const loadingUserBookmarksSelector = createSelector(stateSelector, state => state.loadingUserBookmarks)
export const loadingSubsInfoSelector = createSelector(stateSelector, state => state.loadingSubsInfo)

export const transactionsSelector = createSelector(stateSelector, state => state.transactions)
export const subscriptionInfoSelector = createSelector(stateSelector, state => state.subsInfo)
export const paidCoursesInfoSelector = createSelector(stateSelector, state => state.paidCoursesInfo)

/**
 * Action Creators
 * */

export function getUserProfile() {
    return { type: GET_USER_INFO_REQUEST, payload: null }
}

export const getUserPaidCourses = () => {
    return { type: GET_USER_PAID_COURSES_REQUEST }
}

export const getUserProfileFull = () => {
    return { type: GET_USER_PAID_COURSES_EXT_REQUEST, payload: null }
}

export const getTransactionHistory = () => {
    return { type: GET_TRANSACTIONS_REQUEST }
}

export const getSubscriptionInfo = () => {
    return { type: GET_SUBS_INFO_REQUEST }
}

export const clearStoredCard = () => {
    return { type: CLEAR_STORED_CARD_REQUEST }
}

export function getUserHistory() {
    return (dispatch) => {
        dispatch({
            type: GET_HISTORY_REQUEST,
            payload: null
        });

        fetch("/api/users/history", {method: 'GET', credentials: 'include'})
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
    return { type : GET_BOOKMARKS_REQUEST }
}

export function getUserBookmarksFull() {
    return (dispatch) => {
        dispatch({
            type: GET_BOOKMARKS_EXT_START,
            payload: null
        });

        fetch("/api/users/bookmark-ext", {method: 'GET', credentials: 'include'})
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

export const switchAutoPay = (values) => {
    return (dispatch) => {
        dispatch({
            type: SWITCH_AUTOPAY_START,
            payload: null
        });

        let _newValue = values.alter.SubsAutoPay

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
            .then(() => {
                dispatch({
                    type: SWITCH_AUTOPAY_SUCCESS,
                    payload: _newValue
                });

            })
            .catch((error) => {
                dispatch({
                    type: SWITCH_AUTOPAY_ERROR,
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

const handleCourse = (data) => {
    if (data.CoverMeta) {
        data.CoverMeta = JSON.parse(data.CoverMeta);
        data.Mask = data.Mask ? data.Mask : '_mask01';
    }
};

const handleLesson = (lesson) => {
    let _readyDate = lesson.ReadyDate ? new Date(lesson.ReadyDate) : null,
        _parsedDate = parseReadyDate(_readyDate);

    lesson.readyMonth = _parsedDate.readyMonth;
    lesson.readyYear = _parsedDate.readyYear;

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

            let _yesterday = new Date(new Date().setDate(new Date().getDate()-1)),
                _yesterdayYear = _yesterday.getFullYear(),
                _yesterdayMonth = Months[_yesterday.getMonth()],
                _yesterdayDay = _yesterday.getDate();

            let _isLastVisitToday = (_year === _todayYear) && (_month === _todayMonth) && (_day === _todayDay),
                _isLastVisitYesterday = (_year === _yesterdayYear) && (_month === _yesterdayMonth) && (_day === _yesterdayDay)

            lesson.lastVisitDate = _lastVisitDate;
            lesson.lastVisitDay = _isLastVisitToday ?
                "??????????????"
                :
                _isLastVisitYesterday ?
                    "??????????"
                    :
                    _day + ' ' + _month + ' ' + _year;
            lesson.lastVisitTime = _hours + ':' + _minutes.toString().padStart(2, "0");

            let _course = data.Courses[lesson.CourseId];

            lesson.courseUrl = _course ? _course.URL : null;
            lesson.courseName = _course ? _course.Name : null;
            lesson.courseIsPaid = _course ? (_course.IsPaid && !_course.IsGift && !_course.IsBought) : false;

            lesson.courseBillingInfo = _course ?
                {
                    Id: _course.Id,
                    ProductId: _course.ProductId,
                    IsPending : _course.IsPending,
                    IsPaid: _course.IsPaid,
                    IsGift : _course.IsGift,
                    IsBought: _course.IsBought,
                    URL: _course.URL
                }
                :
                null;

            let _author = data.Authors[lesson.AuthorId];

            lesson.authorUrl = _author ? _author.URL : null;
            lesson.authorName = _author ? _author.FirstName + ' ' + _author.LastName : null;

            lesson.analyticsInfo = _course ?
                {
                    Id: _course.Id,
                    Name: _course.Name,
                    author: lesson.authorName,
                    category : data.Categories[_course.Categories[0]].Name,
                    price: _course.IsPaid ? (_course.DPrice ? _course.DPrice : _course.Price) : 0,
                    lessonName: lesson.Name
                }
                :
                null;
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

        data.Courses.sort((a, b) => {
            return a.Order - b.Order
        })
    }

    if (data.Lessons) {
        data.Lessons.forEach((lesson) => {
            handleLesson(lesson);

            let _course = data.LessonCourses[lesson.CourseId];

            _course.minOrder = _course.minOrder
                ?
                (_course.minOrder < lesson.Order) ? _course.minOrder : lesson.Order
                :
                lesson.Order;

            lesson.courseUrl = _course ? _course.URL : null;
            lesson.courseBillingInfo = _course ?
                {
                    Id: _course.Id,
                    ProductId: _course.ProductId,
                    IsPending : _course.IsPending,
                    IsPaid: _course.IsPaid,
                    IsGift : _course.IsGift,
                    IsBought: _course.IsBought,
                    URL: _course.URL
                }
                :
                null;
            lesson.courseName = _course ? _course.Name : null;
            lesson.courseIsPaid = _course ? (_course.IsPaid && !_course.IsGift && !_course.IsBought) : false;
            lesson.singleLessonInCourse = _course ? _course.OneLesson : false;

            let _author = data.Authors[lesson.AuthorId];

            lesson.authorUrl = _author ? _author.URL : null;
            lesson.authorName = _author ? _author.FirstName + ' ' + _author.LastName : null;

            lesson.analyticsInfo = _course ?
                {
                    Id: _course.Id,
                    Name: _course.Name,
                    author: lesson.authorName,
                    category : (_course.Categories[0] && data.Categories[_course.Categories[0]]) ? data.Categories[_course.Categories[0]].Name : 'unknown',
                    price: _course.IsPaid ? (_course.DPrice ? _course.DPrice : _course.Price) : 0,
                    lessonName: lesson.Name
                }
                :
                null;
        })

        data.Lessons.sort((a, b) => {
            let _courseA = data.LessonCourses[a.CourseId];
            let _courseB = data.LessonCourses[b.CourseId];

            let _result = _courseA.minOrder - _courseB.minOrder;

            if (_result === 0) {
                _result = a.Number - b.Number
                // _result = a.Order - b.Order
            }

            return _result
        })
    }
}

const _handlePaidCoursesData = (data) => {
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

        data.Courses.sort((a, b) => {
            return a.Order - b.Order
        })
    }
}

/**
 * Sagas watcher
 */
function* watchGetUserProfile() {
    yield call(getUserProfileSaga);
    yield call(getUserPaidCoursesSaga);
    yield call(getUserBookmarksSaga);

    yield put({type: FINISH_LOAD_PROFILE})
}

function* watchPaymentSuccess() {
    yield fork(getUserBookmarksSaga);
    yield fork(getUserPaidCoursesSaga);
}

/**
 * Saga workers
 */
function* getUserProfileSaga() {
    yield put({type: GET_USER_INFO_START})

    try {
        let _data = yield call(_fetchUserProfile)

        yield put({
            type: GET_USER_INFO_SUCCESS,
            payload: _data
        })
    } catch (error) {
        yield put({
            type: GET_USER_INFO_ERROR,
            payload: {error}
        })
    }
}

const _fetchUserProfile = () => {
    return fetch("/api/users", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* getUserPaidCoursesSaga() {
    yield put({type: GET_USER_PAID_COURSES_START})

    try {
        let _data = yield call(_fetchPaidCourses)

        yield put({
            type: GET_USER_PAID_COURSES_SUCCESS,
            payload: _data
        })
    } catch (error) {
        yield put({
            type: GET_USER_PAID_COURSES_FAIL,
            payload: {error}
        })
    }
}

function* getUserPaidCoursesExtSaga() {
    yield put({type: GET_USER_PAID_COURSES_EXT_START})

    try {
        let _data = yield call(_fetchPaidCoursesExt)
        _handlePaidCoursesData(_data)

        yield put({
            type: GET_USER_PAID_COURSES_EXT_SUCCESS,
            payload: _data.Courses ? _data.Courses : []
        })
    } catch (error) {
        yield put({
            type: GET_USER_PAID_COURSES_EXT_FAIL,
            payload: {error}
        })
    }
}

function* getUserBookmarksSaga() {
    yield put({ type: GET_BOOKMARKS_START });

    try {
        let _data = yield call(_fetchBookmarks)

        yield put({ type: GET_BOOKMARKS_SUCCESS, payload: _data })
    } catch (error) {
        yield put({
            type: GET_BOOKMARKS_ERROR,
            payload: {error}
        })
    }
}

function* getTransactionHistorySaga() {
    yield put({ type: GET_TRANSACTIONS_START });

    try {
        let _data = yield call(_fetchTransactionHistory)

        yield put({ type: GET_TRANSACTIONS_SUCCESS, payload: _data.data })
    } catch (error) {
        yield put({
            type: GET_TRANSACTIONS_ERROR,
            payload: {error}
        })
    }
}

function* getSubscriptionInfoSaga(){
    yield put ({ type: GET_SUBS_INFO_START });

    try {
        let _data = yield call(_fetchSubsInfo)

        yield put({ type: GET_SUBS_INFO_SUCCESS, payload: _data })
    } catch (error) {
        yield put({ type: GET_SUBS_INFO_ERROR, payload: {error} })
    }
}

function* clearStoredCardSaga() {
    yield put({ type: CLEAR_STORED_CARD_START });

    try {
        yield call(_fetchClearStoredCard)
        yield put({ type: CLEAR_STORED_CARD_SUCCESS })
        yield put({ type: GET_SUBS_INFO_REQUEST })
    } catch (error) {
        yield put({ type: CLEAR_STORED_CARD_FAIL })
        yield put({type: SHOW_MODAL_MESSAGE_ERROR, payload: {error}})
    }
}

const _fetchPaidCourses = () => {
    return fetch("/api/users/paid/courses?gift=true&paid=true", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

const _fetchPaidCoursesExt = () => {
    return fetch("/api/users/paid/courses-ext?gift=true&paid=true", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

const _fetchBookmarks = () => {
    return fetch("/api/users/bookmark", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

const _fetchTransactionHistory = () => {
    return fetch("/api/users/invoice", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

const _fetchSubsInfo = () => {
    return fetch("/api/users/subs-info", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

const _fetchClearStoredCard = () => {
    const _data = { alter:{ SubsAutoPayId:null } }

    return fetch("/api/users", {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(_data),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

export const saga = function* () {
    yield all([
        takeEvery(GET_USER_INFO_REQUEST, watchGetUserProfile),
        takeEvery(GET_BOOKMARKS_REQUEST, getUserBookmarksSaga),
        takeEvery(GET_USER_PAID_COURSES_REQUEST, getUserPaidCoursesSaga),
        takeEvery(SEND_PAYMENT_SUCCESS, watchPaymentSuccess),
        takeEvery(GET_USER_PAID_COURSES_EXT_REQUEST, getUserPaidCoursesExtSaga),
        takeEvery(GET_TRANSACTIONS_REQUEST, getTransactionHistorySaga),
        takeEvery(GET_SUBS_INFO_REQUEST, getSubscriptionInfoSaga),
        takeEvery(CLEAR_STORED_CARD_REQUEST, clearStoredCardSaga),
    ])
}

const Months = [
    '????????????',
    '??????????????',
    '??????????',
    '????????????',
    '??????',
    '????????',
    '????????',
    '??????????????',
    '????????????????',
    '??????????????',
    '????????????',
    '??????????????',
];

let mockTransactions = {
    "data": [
        {
            "Id": 20,
            "UserId": 9459,
            "ParentId": null,
            "InvoiceTypeId": 1,
            "StateId": 3,
            "CurrencyId": 1,
            "CurrencyCode": "RUB",
            "ChequeId": 20,
            "Name": "?????????? ???20/9459",
            "Description": null,
            "InvoiceNum": "20/9459",
            "InvoiceDate": "2018-12-17T18:45:23.455Z",
            "Sum": 200,
            "RefundSum": 200,
            "Items": [
                {
                    "Id": 20,
                    "ProductId": 3,
                    "VATTypeId": 1,
                    "Code": "SUBS1M",
                    "Name": "???????????????? ???? 1 ??????.",
                    "VATRate": 18,
                    "Price": 200,
                    "Qty": 1,
                    "RefundQty": 1,
                    "ExtFields": {
                        "prodType": 1,
                        "prod": {
                            "units": "m",
                            "duration": 1
                        },
                        "vat": {
                            "yandexKassaCode": 4
                        }
                    }
                }
            ]
        },
        {
            "Id": 23,
            "UserId": 9459,
            "ParentId": 20,
            "InvoiceTypeId": 2,
            "StateId": 3,
            "CurrencyId": 1,
            "CurrencyCode": "RUB",
            "ChequeId": 22,
            "Name": "?????????????? ???23/9459",
            "Description": null,
            "InvoiceNum": "23/9459",
            "InvoiceDate": "2018-12-18T19:38:04.265Z",
            "Sum": 200,
            "RefundSum": 0,
            "Items": [
                {
                    "Id": 22,
                    "ProductId": 3,
                    "VATTypeId": 1,
                    "Code": "SUBS1M",
                    "Name": "???????????????? ???? 1 ??????.",
                    "VATRate": 18,
                    "Price": 200,
                    "Qty": 1,
                    "RefundQty": 0,
                    "ExtFields": {
                        "prodType": 1,
                        "prod": {
                            "units": "m",
                            "duration": 1
                        },
                        "vat": {
                            "yandexKassaCode": 4
                        }
                    }
                }
            ]
        }
    ]
}

let mockSubsInfo = {
    Id: 7973,
    Payment: {
        type: "bank_card",
        id: "23ac20e6-000f-5000-a000-1c7308d8d202",
        saved: true,
        card: {
            first6: "555555",
            last4: "4444",
            expiry_month: "12",
            expiry_year: "2025",
            card_type: "MasterCard"
        },
        title: "Bank card *4444"
    },
    Error: {message: 'error'},
    SubsAutoPay: false,
    SubsExpDate: "2019-12-17T18:45:23.455Z",
}