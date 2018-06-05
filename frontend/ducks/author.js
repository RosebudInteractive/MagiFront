// import {all, takeEvery, take, put, apply, call} from 'redux-saga/effects'
// import {eventChannel} from 'redux-saga'
import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";


// import {replace} from 'react-router-redux'

/**
 * Constants
 * */
export const moduleName = 'author'
const prefix = `${appName}/${moduleName}`

export const GET_AUTHOR_REQUEST = `${prefix}/GET_AUTHOR_REQUEST`
export const GET_AUTHOR_SUCCESS = `${prefix}/GET_AUTHOR_SUCCESS`
export const GET_AUTHOR_ERROR = `${prefix}/GET_AUTHOR_ERROR`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    author: null,
    loading: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_AUTHOR_REQUEST:
            return state
                .set('error', null)
                .set('loading', true)

        case GET_AUTHOR_SUCCESS:
            return state
                .set('loading', false)
                .set('author', payload)

        case GET_AUTHOR_ERROR:
            return state
                .set('loading', false)
                .set('error', payload.error)

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const authorSelector = createSelector(stateSelector, state => state.author)
export const errorSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.loading)

/**
 * Action Creators
 * */

export function getAuthor(url) {
    return (dispatch) => {
        dispatch({
            type: GET_AUTHOR_REQUEST,
            payload: {url}
        });

        fetch("/api/authors/" + url, {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                handleData(data);
                dispatch({
                    type: GET_AUTHOR_SUCCESS,
                    payload: data
                });
            })
            .catch((err) => {
                dispatch({
                    type: GET_AUTHOR_ERROR,
                    payload: err
                });
            });
    }
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