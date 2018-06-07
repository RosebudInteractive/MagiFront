// import {all, takeEvery, take, put, apply, call} from 'redux-saga/effects'
// import {eventChannel} from 'redux-saga'
import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {
    RECOVERY_PASSWORD_FAIL,
    RECOVERY_PASSWORD_START,
    RECOVERY_PASSWORD_SUCCESS,
    SWITCH_TO_RECOVERY_PASSWORD_SUCCESS
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

export const CLEAR_ERROR = `${prefix}/CLEAR_ERROR`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    user: null,
    history: [],
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
            .catch((err) => {
                dispatch({
                    type: GET_USER_INFO_ERROR,
                    payload: err
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
            .catch((err) => {
                dispatch({
                    type: GET_HISTORY_ERROR,
                    payload: err
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
                _day = _lastVisitDate.getDay(),
                _hours = _lastVisitDate.getHours(),
                _minutes = _lastVisitDate.getMinutes();

            let _today = new Date(),
                _todayYear = _today.getFullYear(),
                _todayMonth = Months[_today.getMonth()],
                _todayDay = _today.getDay();

            let _isLastVisitToday = (_year === _todayYear) && (_month === _todayMonth) && (_day === _todayDay);

            lesson.lastVisitDay = _isLastVisitToday ? "Сегодня" : _day + ' ' + _month + ' ' + _year;
            lesson.lastVisitTime = _hours + ':' + _minutes;

            let _course = data.Courses[lesson.CourseId];

            lesson.courseUrl = _course ? _course.URL : null;
            lesson.courseName = _course ? _course.Name : null;

            let _author = data.Authors[lesson.AuthorId];

            lesson.authorUrl = _author ? _author.URL : null;
            lesson.authorName = _author ? _author.FirstName + ' ' + _author.FirstName : null;
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