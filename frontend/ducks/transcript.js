import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import {all, call, put, takeEvery, select,} from "@redux-saga/core/effects";
import {commonGetQuery} from "tools/fetch-tools";
import {GET_LESSON_SUCCESS} from "../constants/lesson";
import TranscriptParser from "tools/transcript";

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

const Gallery = Record({
    items: [],
    visible: false,
    currentIndex: 0,
})

const ReducerRecord = Record({
    loading: false,
    transcript: null,
    html: null,
    episodesTimes: false,
    timeStamps: false,
    paragraphs: null,
    refs: [],
    assets: null,
    gallery: new Gallery(),

})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_TRANSCRIPT_START:
            return state
                .set('loading', true)

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
                .setIn(['gallery', 'items'], payload.gallery)

        case GET_TRANSCRIPT_FAIL:
            return state
                .set('loading', false)

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
export const transcriptSelector = createSelector(stateSelector, state => state.transcript)
export const textSelector = createSelector(stateSelector, state => state.html)
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


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
            takeEvery(GET_TRANSCRIPT_REQUEST, getTranscriptSaga),
            takeEvery(GET_LESSON_SUCCESS, loadAssetsInfoSaga),
            takeEvery(SHOW_GALLERY_REQUEST, showGallerySaga)
        ]
    )
}

function* getTranscriptSaga(data) {
    yield put({type: GET_TRANSCRIPT_START})

    try {
        const {courseUrl, lessonUrl, requestAssets, lessonId} = data.payload

        let _transcript, _assets

        if (requestAssets) {
            [_transcript, _assets] = yield all([
                call(commonGetQuery, `/api/lessons-text/${courseUrl}/${lessonUrl}`),
                call(commonGetQuery, `/api/lessons/play/${lessonId}`)
            ])
        } else {
            _transcript = yield call(commonGetQuery, `/api/lessons-text/${courseUrl}/${lessonUrl}`)
        }



        let _transcriptData = new TranscriptParser({transcript: _transcript, playInfo: _assets}),
            _payload = {
                transcript: _transcript,
                html: _transcriptData.html && (_transcriptData.html.length > 0) ? _transcriptData.html : null,
                timeStamps: _transcriptData.timeStamps,
                paragraphs: _transcriptData.paragraphs,
                episodesTimes: _transcriptData.episodesTimes,
                refsVisible: _transcript.Refs && Array.isArray(_transcript.Refs) && (_transcript.Refs.length > 0),
                assets: _assets,
                gallery: (_transcript.Galery && _transcript.Galery.length) ? _transcript.Galery : []
            }

        yield put({type: GET_TRANSCRIPT_SUCCESS, payload: _payload})
    } catch (error) {

        console.log(error)

        yield put({type: GET_TRANSCRIPT_FAIL, payload: {error}})
    }
}

// /api/lessons/play/

function* loadAssetsInfoSaga() {

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
