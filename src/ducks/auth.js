import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, Set, List} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
// import {
//     SIGN_IN_SUCCESS,
//     LOGOUT_SUCCESS,
// } from "../constants/user";
// import {
//     CLOSE_SIGN_IN_FORM,
//     SIGN_IN_FAIL,
//     SIGN_IN_START,
//     SWITCH_TO_RECOVERY_PASSWORD
// } from "../../frontend/constants/user";
import {reset} from "redux-form";

/**
 * Constants
 * */
export const moduleName = 'auth'
const prefix = `${appName}/${moduleName}`

export const WHO_AM_I_START = `${prefix}/WHO_AM_I_START`
export const WHO_AM_I_SUCCESS = `${prefix}/WHO_AM_I_SUCCESS`
export const WHO_AM_I_FAIL = `${prefix}/WHO_AM_I_FAIL`

// export const GET_HISTORY_REQUEST = `${prefix}/GET_HISTORY_REQUEST`
// export const GET_HISTORY_SUCCESS = `${prefix}/GET_HISTORY_SUCCESS`
// export const GET_HISTORY_ERROR = `${prefix}/GET_HISTORY_ERROR`
//
// export const CHANGE_PASSWORD_START = `${prefix}/CHANGE_PASSWORD_START`
// export const CHANGE_PASSWORD_SUCCESS = `${prefix}/CHANGE_PASSWORD_SUCCESS`
// export const CHANGE_PASSWORD_ERROR = `${prefix}/CHANGE_PASSWORD_ERROR`
//
// export const GET_BOOKMARKS_START = `${prefix}/GET_BOOKMARKS_START`
// export const GET_BOOKMARKS_SUCCESS = `${prefix}/GET_BOOKMARKS_SUCCESS`
// export const GET_BOOKMARKS_ERROR = `${prefix}/GET_BOOKMARKS_ERROR`
//
// export const GET_BOOKMARKS_EXT_START = `${prefix}/GET_BOOKMARKS_EXT_START`
// export const GET_BOOKMARKS_EXT_SUCCESS = `${prefix}/GET_BOOKMARKS_EXT_SUCCESS`
// export const GET_BOOKMARKS_EXT_ERROR = `${prefix}/GET_BOOKMARKS_EXT_ERROR`
//
// export const ADD_COURSE_TO_BOOKMARKS_START = `${prefix}/ADD_COURSE_TO_BOOKMARKS_START`
// export const ADD_COURSE_TO_BOOKMARKS_SUCCESS = `${prefix}/ADD_COURSE_TO_BOOKMARKS_SUCCESS`
// export const ADD_COURSE_TO_BOOKMARKS_ERROR = `${prefix}/ADD_COURSE_TO_BOOKMARKS_ERROR`
//
// export const REMOVE_COURSE_FROM_BOOKMARKS_START = `${prefix}/REMOVE_COURSE_FROM_BOOKMARKS_START`
// export const REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS = `${prefix}/REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS`
// export const REMOVE_COURSE_FROM_BOOKMARKS_ERROR = `${prefix}/REMOVE_COURSE_FROM_BOOKMARKS_ERROR`
//
// export const ADD_LESSON_TO_BOOKMARKS_START = `${prefix}/ADD_LESSON_TO_BOOKMARKS_START`
// export const ADD_LESSON_TO_BOOKMARKS_SUCCESS = `${prefix}/ADD_LESSON_TO_BOOKMARKS_SUCCESS`
// export const ADD_LESSON_TO_BOOKMARKS_ERROR = `${prefix}/ADD_LESSON_TO_BOOKMARKS_ERROR`
//
// export const REMOVE_LESSON_FROM_BOOKMARKS_START = `${prefix}/REMOVE_LESSON_FROM_BOOKMARKS_START`
// export const REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS = `${prefix}/REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS`
// export const REMOVE_LESSON_FROM_BOOKMARKS_ERROR = `${prefix}/REMOVE_LESSON_FROM_BOOKMARKS_ERROR`

export const CLEAR_ERROR = `${prefix}/CLEAR_ERROR`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    user: null,
    authorized: false,
    loading: false,
    error: null
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case WHO_AM_I_START:
            return state
                .set('error', null)
                .set('loading', true)
                .set('authorized', false)

        case WHO_AM_I_SUCCESS:
            return state
                .set('loading', false)
                .set('user', payload)
                .set('authorized', true)

        // case LOGOUT_SUCCESS:
        //     return state
        //         .clear()
        //
        // case GET_HISTORY_ERROR:
        // case CHANGE_PASSWORD_ERROR:
        //     return state
        //         .set('loading', false)
        //         .set('error', payload.error.message)
        //
        // case GET_HISTORY_SUCCESS:
        //     return state
        //     // .set('loading', false)
        //         .set('history', payload)
        //
        // case CHANGE_PASSWORD_SUCCESS:
        //     return state
        //         .set('user', payload)
        //         .set('error', null)
        //
        // case CLEAR_ERROR:
        //     return state
        //         .set('error', null)
        //
        // case GET_BOOKMARKS_START:
        //     return state
        //         .set('error', null)
        //         .set('loadingUserBookmarks', true)
        //         .update('bookmarks', bookmarks => bookmarks.clear())
        //
        // case GET_BOOKMARKS_EXT_START:
        //     return state
        //         .set('error', null)
        //         .set('loadingBookmarks', true)
        //         .update('courseBookmarks', courseBookmarks => courseBookmarks.clear())
        //         .update('lessonBookmarks', lessonBookmarks => lessonBookmarks.clear())
        //
        // case GET_BOOKMARKS_EXT_SUCCESS:
        //     return state
        //         .set('error', null)
        //         .set('loadingBookmarks', false)
        //         .update('courseBookmarks', courseBookmarks => courseBookmarks.concat(payload.Courses))
        //         .update('lessonBookmarks', lessonBookmarks => lessonBookmarks.concat(payload.Lessons))
        //
        // case GET_BOOKMARKS_SUCCESS:
        //     return state
        //         .set('loadingUserBookmarks', false)
        //         .update('bookmarks', bookmarks => bookmarks.union(payload))
        //
        // case GET_BOOKMARKS_ERROR:
        //     return state
        //         .set('loadingUserBookmarks', false)
        //         .set('error', payload.error.message)
        //
        // case GET_BOOKMARKS_EXT_ERROR:
        //     return state
        //         .set('loadingBookmarks', false)
        //         .set('error', payload.error.message)
        //
        // case ADD_COURSE_TO_BOOKMARKS_SUCCESS:
        // case ADD_LESSON_TO_BOOKMARKS_SUCCESS:
        //     return state
        //         .update('bookmarks', bookmarks => bookmarks.add(payload))
        //
        // case REMOVE_COURSE_FROM_BOOKMARKS_SUCCESS:
        //     return state
        //         .update('bookmarks', bookmarks => bookmarks.delete(payload))
        // // .update('courseBookmarks', courseBookmarks => {
        // //     let _index = courseBookmarks.findIndex((course) => {
        // //         return course.URL === payload
        // //     })
        // //
        // //     return (_index >= 0) ?
        // //         courseBookmarks.splice(_index, 1)
        // //         :
        // //         courseBookmarks
        // //     })
        //
        // case REMOVE_LESSON_FROM_BOOKMARKS_SUCCESS:
        //     return state
        //         .update('bookmarks', bookmarks => bookmarks.delete(payload.courseUrl + '/' + payload.lessonUrl))
        // // .update('lessonBookmarks', lessonBookmarks => {
        // //     let _index = lessonBookmarks.findIndex((lesson) => {
        // //         return (lesson.URL === payload.lessonUrl) && (lesson.courseUrl === payload.courseUrl)
        // //     })
        // //
        // //     return (_index >= 0) ?
        // //         lessonBookmarks.splice(_index, 1)
        // //         :
        // //         lessonBookmarks
        // // })

        default:
            return state
    }
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const userSelector = createSelector(stateSelector, state => state.user)
export const userAuthSelector = createSelector(stateSelector, state => state.authorized)

export const errorSelector = createSelector(stateSelector, state => state.error)
export const loadingSelector = createSelector(stateSelector, state => state.loading)

/**
 * Action Creators
 * */

export const whoAmI = () => {
    return (dispatch) => {

        dispatch({
            type: WHO_AM_I_START,
            payload: null
        });

        fetch("/api/whoami", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                dispatch({
                    type: WHO_AM_I_SUCCESS,
                    payload: data
                });
            })
            .catch((error) => {
                dispatch({
                    type: WHO_AM_I_FAIL,
                    payload: {error}
                });
            });
    }
}

export const login = (values) => {
    return (dispatch) => {

        dispatch({
            type: SIGN_IN_START,
            payload: null
        });

        fetch("/api/login", {
            method: 'POST',
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
                    type: SIGN_IN_SUCCESS,
                    payload: data
                });

                dispatch(reset('SignInForm'));

                dispatch({
                    type: CLOSE_SIGN_IN_FORM,
                    payload: null
                });
            })
            .catch((error) => {
                if (error.message === '"Old style" user.') {
                    dispatch({
                        type: SWITCH_TO_RECOVERY_PASSWORD,
                        payload: values
                    })
                } else {
                    dispatch({
                        type: SIGN_IN_FAIL,
                        payload: {error}
                    });
                }
            });
    }
}

