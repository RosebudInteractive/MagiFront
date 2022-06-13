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

    default:
      return state;
  }
}

/**
 * Selectors
 * */const stateSelector = (state: any) => state[moduleName];
export const fetching = createSelector(stateSelector, (state: ImagesReducer) => state.fetching);
export const imagesSelector = createSelector(stateSelector, (state: ImagesReducer) => state.images);

/**
 * Action Creators
 * */
type QueryOptionsType = { lessonId?: number, taskId?: number };
export const getImages = (options: QueryOptionsType) => {
  console.log(options);
  return {
    type: GET_IMAGES_REQUEST,
    payload: options,
  };
};

/**
 * Sagas
 */
function* getImagesSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    // const dbImages: Array<ImageDbInfo> =
    // yield call(commonGetQuery, `/api/pm/pictures?lessonId=${payload?.lessonId}`);
    console.log('getImagesSaga');
    const dbImages: Array<ImageDbInfo> = yield call(commonGetQuery, `/api/pm/pictures?lessonId=${payload.lessonId}`);
    yield put({ type: GET_IMAGES_SUCCESS, payload: convertDbImageInfo(dbImages) });
    yield put({ type: STOP_FETCHING });
  } catch (e: any) {
    yield put({ type: GET_IMAGES_FAIL });
    yield put(showError({ content: e.message }));
  }
}

// eslint-disable-next-line func-names
export const saga = function* () {
  yield all([
    takeEvery(GET_IMAGES_REQUEST, getImagesSaga),
  ]);
};
