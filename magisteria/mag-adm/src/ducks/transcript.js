import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import {all, call, put, takeEvery, select,} from "@redux-saga/core/effects";
import {commonGetQuery} from "#common/tools/fetch-tools";
import TranscriptParser from "#adm/tools/transcript";
import {handleCourse} from "../actions/course/courseActions";
import {handleLesson} from "../actions/lesson/lesson-actions";
import {GET_SINGLE_COURSE_SUCCESS} from "../constants/course/singleCourse";
import {GET_SINGLE_LESSON_SUCCESS} from "../constants/lesson/singleLesson";
import {SHOW_ERROR_DIALOG} from "../constants/Common";

/**
 * Constants
 * */
export const moduleName = 'transcript'
const prefix = `${appName}/${moduleName}`

const GET_TRANSCRIPT_REQUEST = `${prefix}/GET_TRANSCRIPT_REQUEST`
const GET_TRANSCRIPT_START = `${prefix}/GET_TRANSCRIPT_START`
const GET_TRANSCRIPT_SUCCESS = `${prefix}/GET_TRANSCRIPT_SUCCESS`
const GET_TRANSCRIPT_FAIL = `${prefix}/GET_TRANSCRIPT_FAIL`

const SHOW_GALLERY_REQUEST = `${prefix}/SHOW_GALLERY_REQUEST`
const SHOW_GALLERY = `${prefix}/SHOW_GALLERY`
const CLOSE_GALLERY = `${prefix}/CLOSE_GALLERY`

const OPEN_EDITOR_REQUEST = `${prefix}/OPEN_EDITOR_REQUEST`
const OPEN_EDITOR = `${prefix}/OPEN_EDITOR`

const Gallery = Record({
    items: [],
    visible: false,
    currentIndex: 0,
})

const ReducerRecord = Record({
    loading: true,
    transcript: null,
    html: null,
    episodesTimes: false,
    timeStamps: false,
    paragraphs: null,
    refs: [],
    assets: null,
    gallery: new Gallery(),
    lesson: null,
    error: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_TRANSCRIPT_START:
            return state
                .set('loading', true)
                .set('error', false)

        case GET_TRANSCRIPT_SUCCESS:
            return state
                .set('loading', false)
                .set('transcript', payload)
                .set('html', payload.html)
                .set('timeStamps', payload.timeStamps)
                .set('paragraphs', payload.paragraphs)
                .set('episodesTimes', payload.episodesTimes)
                .set('refs', payload.transcript.Refs)
                .set('assets', payload.assets)
                .set('lesson', payload.lesson)
                .setIn(['gallery', 'items'], payload.gallery)

        case GET_TRANSCRIPT_FAIL:
            return state
                .set('loading', false)
                .set('error', true)

        case SHOW_GALLERY:
            return state
                .update("gallery", (gallery) => {
                    return gallery
                        .set("visible", true)
                        .set("currentIndex", payload)
                })

        case CLOSE_GALLERY:
            return state
                .update("gallery", (gallery) => {
                    return gallery
                        .set("visible", false)
                        .set("currentIndex", 0)
                })

        default:
            return state
    }
}

/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const hasErrorSelector = createSelector(stateSelector, state => state.error)
export const transcriptSelector = createSelector(stateSelector, state => state.transcript)
export const textSelector = createSelector(stateSelector, state => state.html)
export const lessonSelector = createSelector(stateSelector, state => state.lesson)
export const timeStampsSelector = createSelector(stateSelector, state => state.timeStamps)
export const paragraphsSelector = createSelector(stateSelector, state => state.paragraphs)
export const episodesTimesSelector = createSelector(stateSelector, state => state.episodesTimes)
export const refsSelector = createSelector(stateSelector, state => state.refs)
export const refsVisibleSelector = createSelector(refsSelector, refs => (refs.length > 0))
export const assetsSelector = createSelector(stateSelector, state => state.assets)
const gallerySelector = createSelector(stateSelector, state => state.gallery)
export const galleryItemsSelector = createSelector(gallerySelector, gallery => gallery.items)
export const galleryVisibleSelector = createSelector(gallerySelector, gallery => gallery.visible)
export const galleryCurrentIndexSelector = createSelector(gallerySelector, gallery => gallery.currentIndex)

/**
 * Action Creators
 * */
export const loadTranscript = (data) => {
    return {type: GET_TRANSCRIPT_REQUEST, payload: data}
}

export const showGallery = (currentSlide) => {
    return {type: SHOW_GALLERY_REQUEST, payload: currentSlide}
}

export const closeGallery = () => {
    return {type: CLOSE_GALLERY}
}

export const openEditor = (data) => {
    return {type: OPEN_EDITOR_REQUEST, payload: data}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
            takeEvery(GET_TRANSCRIPT_REQUEST, getTranscriptSaga),
            takeEvery(OPEN_EDITOR_REQUEST, openEditorSaga),
            // takeEvery(GET_LESSON_SUCCESS, loadAssetsInfoSaga),
            takeEvery(SHOW_GALLERY_REQUEST, showGallerySaga)
        ]
    )
}

function* openEditorSaga(data) {
    console.log("open")

    yield put({type: OPEN_EDITOR})

    yield put(loadTranscript(data.payload))
}

function* getTranscriptSaga(data) {
    yield put({type: GET_TRANSCRIPT_START})

    try {
        const {courseId, lessonId} = data.payload
        let course, lesson

        [course, lesson] = yield all([
            call(commonGetQuery, `/api/adm/courses/${courseId}`),
            call(commonGetQuery, `/api/adm/lessons/${lessonId}/${courseId}`)
        ])

        course = handleCourse(course)
        lesson = handleLesson(lesson)

        yield put({type: GET_SINGLE_COURSE_SUCCESS, payload: course})
        yield put({type: GET_SINGLE_LESSON_SUCCESS, payload: lesson})

        let _transcript, _assets, _lessonWithAudio

        [_transcript, _assets, _lessonWithAudio] = yield all([
            call(commonGetQuery, `/api/lessons-text/${course.URL}/${lesson.URL}`),
            call(commonGetQuery, `/api/lessons/play/${lessonId}`),
            call(commonGetQuery, `/api/lessons/v2/${course.URL}/${lesson.URL}`)
        ])


        let _transcriptData = new TranscriptParser({transcript: _transcript, playInfo: _assets}),
            _payload = {
                transcript: _transcript,
                html: _transcriptData.html && (_transcriptData.html.length > 0) ? _transcriptData.html : null,
                timeStamps: _transcriptData.timeStamps,
                paragraphs: _transcriptData.paragraphs,
                episodesTimes: _transcriptData.episodesTimes,
                refsVisible: _transcript.Refs && Array.isArray(_transcript.Refs) && (_transcript.Refs.length > 0),
                assets: _assets,
                gallery: (_transcript.Galery && _transcript.Galery.length) ? _transcript.Galery : [],
                lesson: _lessonWithAudio
            }

        yield put({type: GET_TRANSCRIPT_SUCCESS, payload: _payload})
    } catch (error) {

        console.log(error)

        yield put({type: GET_TRANSCRIPT_FAIL, payload: {error}})
        yield put({type: SHOW_ERROR_DIALOG, payload: error.message})
    }
}

function* showGallerySaga(data) {
    const current = data.payload

    if (current) {
        const _items = yield select(galleryItemsSelector),
            _index = _items.findIndex(item => item.Id === current.id)

        yield put({type: SHOW_GALLERY, payload: _index > 0 ? _index : 0})
    } else {
        yield put({type: SHOW_GALLERY, payload: 0})
    }
}
