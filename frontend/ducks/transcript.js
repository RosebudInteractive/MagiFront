import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import {all, call, put, takeEvery, select,} from "@redux-saga/core/effects";
import {commonGetQuery} from "tools/fetch-tools";
import React from "react";
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


const ReducerRecord = Record({
    loading: false,
    transcript: null,
    html: null,
    episodesTimes: false,
    timeStamps: false,
    refs: [],
    assets: null,
    gallery: [],
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
                .set('episodesTimes', payload.episodesTimes)
                .set('refs', payload.transcript.Refs)
                .set('assets', payload.assets)
                .set('gallery', payload.gallery)

        case GET_TRANSCRIPT_FAIL:
            return state
                .set('loading', false)

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
export const episodesTimesSelector = createSelector(stateSelector, state => state.episodesTimes)
export const refsSelector = createSelector(stateSelector, state => state.refs)
export const refsVisibleSelector = createSelector(refsSelector, refs => (refs.length > 0))
export const assetsSelector = createSelector(stateSelector, state => state.assets)
export const gallerySelector = createSelector(stateSelector, state => state.gallery)

/**
 * Action Creators
 * */
export const loadTranscript = (data) => {
    return {type: GET_TRANSCRIPT_REQUEST, payload: data}
}


/**
 * Sagas
 */
export const saga = function* () {
    yield all([
            takeEvery(GET_TRANSCRIPT_REQUEST, getTranscriptSaga),
            takeEvery(GET_LESSON_SUCCESS, loadAssetsInfoSaga)
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
