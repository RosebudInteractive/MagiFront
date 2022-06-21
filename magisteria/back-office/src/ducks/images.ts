import { createSelector } from 'reselect';
import { AnyAction } from 'redux';
import {
  all, call, put, takeEvery,
} from '@redux-saga/core/effects';
// @ts-ignore
import { commonGetQuery } from '#common/tools/fetch-tools';
import { appName } from '../config';
import { ImageDbInfo, ImageInfo } from '#types/images';
import { showError } from '#src/ducks/messages';
import { convertDbImageInfo } from '#src/ducks/images-queries';

/**
 * Constants
 * */
export const moduleName = 'images';
const prefix = `${appName}/${moduleName}`;

const START_FETCHING = `${prefix}/START_FETCHING`;
const STOP_FETCHING = `${prefix}/STOP_FETCHING`;

const GET_IMAGES_REQUEST = `${prefix}/GET_IMAGES_REQUEST`;
const GET_IMAGES_SUCCESS = `${prefix}/GET_IMAGES_SUCCESS`;
const GET_IMAGES_FAIL = `${prefix}/GET_IMAGES_FAIL`;

const CLEAR_IMAGES_REQUEST = `${prefix}/CLEAR_IMAGES_REQUEST`;
const CLEAR_IMAGES = `${prefix}/CLEAR_IMAGES`;

/**
 * Reducer
 * */
export interface ImagesReducer {
  fetching: boolean;
  images: Array<ImageInfo> | null;
  error: string | null;
}

export const initialState: ImagesReducer = {
  fetching: false,
  images: null,
  error: null,
};

export default function reducer(state = initialState, action: AnyAction) {
  const { type, payload } = action;

  switch (type) {
    case START_FETCHING:
      return { ...state, fetching: true };

    case STOP_FETCHING:
      return { ...state, fetching: false };

    case GET_IMAGES_SUCCESS:
      return { ...state, images: payload };

    case GET_IMAGES_FAIL:
      return { ...state, images: null };

    case CLEAR_IMAGES:
      return { ...state, images: null };

    default:
      return state;
  }
}

/**
 * Selectors
 * */
const stateSelector = (state: any) => state[moduleName];
export const fetchingSelector = createSelector(stateSelector,
  (state: ImagesReducer) => state.fetching);
export const imagesSelector = createSelector(stateSelector, (state: ImagesReducer) => state.images);

/**
 * Action Creators
 * */
type QueryOptionsType = { lessonId?: number, taskId?: number };
export const getImages = (options: QueryOptionsType) => ({
  type: GET_IMAGES_REQUEST,
  payload: options,
});

export const clearImages = () => ({
  type: CLEAR_IMAGES_REQUEST,
});

/**
 * Sagas
 */
function* getImagesSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    // const dbImages: Array<ImageDbInfo> =
    // yield call(commonGetQuery, `/api/pm/pictures?lessonId=${payload?.lessonId}`);
    const dbImages: Array<ImageDbInfo> = yield call(commonGetQuery, `/api/pm/pictures?lessonId=${payload.lessonId}`);
    yield put({ type: GET_IMAGES_SUCCESS, payload: convertDbImageInfo(dbImages) });
    yield put({ type: STOP_FETCHING });
  } catch (e: any) {
    yield put({ type: GET_IMAGES_FAIL });
    yield put(showError({ content: e.message }));
  }
}

function* clearImagesSaga() {
  yield put({ type: CLEAR_IMAGES });
}

// eslint-disable-next-line func-names
export const saga = function* () {
  yield all([
    takeEvery(GET_IMAGES_REQUEST, getImagesSaga),
    takeEvery(CLEAR_IMAGES_REQUEST, clearImagesSaga),
  ]);
};
