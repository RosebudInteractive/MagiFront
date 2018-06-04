// import {all, takeEvery, take, put, apply, call} from 'redux-saga/effects'
// import {eventChannel} from 'redux-saga'
import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
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
                .set('author', payload.author)

        case GET_AUTHOR_ERROR:
            return state
                .set('loading', false)
                .set('error', payload.error.message)

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
    return {
        type: GET_AUTHOR_REQUEST,
        payload: { url }
    }
}


// export function signIn(email, password) {
//     return {
//         type: SIGN_IN_REQUEST,
//         payload: { email, password }
//     }
// }
//
// export function signOut() {
//     return {
//         type: SIGN_OUT_REQUEST
//     }
// }

/**
 * Sagas
 */

// export const signUpSaga = function * () {
//     while (true) {
//         const action = yield take(SIGN_UP_REQUEST)
//         const {email, password} = action.payload
//
//         yield put({
//             type: SIGN_UP_START
//         })
//
//         try {
//             const auth = firebase.auth()
//             yield call([auth, auth.createUserWithEmailAndPassword], email, password)
//         } catch (error) {
//             yield put({
//                 type: SIGN_UP_ERROR,
//                 payload: {error}
//             })
//         }
//     }
// }
//
// export const signInSaga = function * (action) {
//     const { email, password } = action.payload
//
//     yield put({
//         type: SIGN_IN_START
//     })
//
//     try {
//         const auth = firebase.auth()
//         yield apply(auth, auth.signInWithEmailAndPassword, [email, password])
//     } catch (error) {
//         yield put({
//             type: SIGN_IN_ERROR,
//             payload: { error }
//         })
//     }
// }
//
// export const signOutSaga = function * () {
//     const auth = firebase.auth()
//     yield apply(auth, auth.signOut)
// }
//
// const createAuthChannel = () => eventChannel(emit => firebase.auth().onAuthStateChanged(user => emit({ user })))
//
// export const watchStatusChangeSaga = function * () {
//     const chan = yield call(createAuthChannel)
//     while (true) {
//         const { user } = yield take(chan)
//
//         if (user) {
//             yield put({
//                 type: SIGN_IN_SUCCESS,
//                 payload: { user }
//             })
//
//         } else {
//             yield put({
//                 type: SIGN_OUT_SUCCESS,
//                 payload: { user }
//             })
//             yield put(replace('/auth/sign-in'))
//         }
//     }
// }
//
//
// export const saga = function * () {
//     yield all([
//         takeEvery(SIGN_IN_REQUEST, signInSaga),
//         takeEvery(SIGN_OUT_REQUEST, signOutSaga),
//         signUpSaga(),
//         watchStatusChangeSaga()
//     ])
// }