import { createSelector } from 'reselect';
import { AnyAction } from 'redux';
import {
  all, call, put, take, takeEvery, race, select,
} from '@redux-saga/core/effects';
// @ts-ignore
import { commonGetQuery } from '#common/tools/fetch-tools';
import { appName } from '../config';
import { ImageDbInfo, ImageInfo } from '#types/images';
import {
  MODAL_MESSAGE_ACCEPT, MODAL_MESSAGE_DECLINE, showError, showUserConfirmation,
} from '#src/ducks/messages';
import { convertDbImageInfo, putImages, search } from '#src/ducks/images-queries';
import type { Message } from '#types/messages';

/**
 * Constants
 * */
export const moduleName = 'images';
const prefix = `${appName}/${moduleName}`;

const START_FETCHING = `${prefix}/START_FETCHING`;
const STOP_FETCHING = `${prefix}/STOP_FETCHING`;

const GET_IMAGES_REQUEST = `${prefix}/GET_IMAGES_REQUEST`;
const SET_IMAGES = `${prefix}/GET_IMAGES_SUCCESS`;
const GET_IMAGES_FAIL = `${prefix}/GET_IMAGES_FAIL`;

const SAVE_IMAGES_REQUEST = `${prefix}/SAVE_IMAGES_REQUEST`;
const DELETE_IMAGE_REQUEST = `${prefix}/DELETE_IMAGE_REQUEST`;

const SEARCH_IMAGE_REQUEST = `${prefix}/SEARCH_IMAGE_REQUEST`;
const SET_SEARCH_RESULT = `${prefix}/SET_SEARCH_RESULT`;

const CLEAR_IMAGES_REQUEST = `${prefix}/CLEAR_IMAGES_REQUEST`;
const CLEAR_IMAGES = `${prefix}/CLEAR_IMAGES`;

/**
 * Reducer
 * */
export interface ImagesReducer {
  fetching: boolean;
  images: Array<ImageInfo> | null;
  searchResult: Array<ImageInfo> | null;
  error: string | null;
}

export const initialState: ImagesReducer = {
  fetching: false,
  images: null,
  searchResult: null,
  error: null,
};

export default function reducer(state = initialState, action: AnyAction) {
  const { type, payload } = action;

  switch (type) {
    case START_FETCHING:
      return { ...state, fetching: true };

    case STOP_FETCHING:
      return { ...state, fetching: false };

    case SET_IMAGES:
      return { ...state, images: payload };

    case SET_SEARCH_RESULT:
      return { ...state, searchResult: payload };

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
export const searchResultSelector = createSelector(stateSelector,
  (state: ImagesReducer) => state.searchResult);

/**
 * Action Creators
 * */
interface QueryOptions { lessonId?: number, taskId?: number }
interface SaveOptions extends QueryOptions{ images: Array<ImageInfo> }
interface DeleteOptions extends QueryOptions{ imageId: number }

export const getImages = (options: QueryOptions) => ({
  type: GET_IMAGES_REQUEST,
  payload: options,
});

export const clearImages = () => ({
  type: CLEAR_IMAGES_REQUEST,
});

export const saveImages = (options: SaveOptions) => ({
  type: SAVE_IMAGES_REQUEST,
  payload: options,
});

export const deleteImage = (options: DeleteOptions) => ({
  type: DELETE_IMAGE_REQUEST,
  payload: options,
});

export const searchImage = (searchValue: string) => ({
  type: SEARCH_IMAGE_REQUEST,
  payload: searchValue,
});

/**
 * Sagas
 */
function* getImagesSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    const dbImages: Array<ImageDbInfo> = yield call(commonGetQuery, `/api/pm/pictures?lessonId=${payload.lessonId}`);
    yield put({ type: SET_IMAGES, payload: convertDbImageInfo(dbImages) });
    yield put({ type: STOP_FETCHING });
  } catch (e: any) {
    yield put({ type: GET_IMAGES_FAIL });
    yield put({ type: STOP_FETCHING });
    yield put(showError({ content: e.message }));
  }
}

function* clearImagesSaga() {
  yield put({ type: CLEAR_IMAGES });
}

function* saveImagesSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    yield call(putImages, payload.lessonId, payload.images);
    yield put({ type: SET_IMAGES, payload: payload.images });
    yield put({ type: STOP_FETCHING });
  } catch (e: any) {
    yield put({ type: STOP_FETCHING });
    yield put(showError({ content: e.message }));
  }
}

function* deleteImageSaga({ payload }: any) {
  const message: Message = {
    content: 'Вы действительно хотите удалить изображение?',
    title: 'Подтверждение удаления',
  };

  yield put(showUserConfirmation(message));

  const { accept } = yield race({
    accept: take(MODAL_MESSAGE_ACCEPT),
    decline: take(MODAL_MESSAGE_DECLINE),
  });

  if (!accept) return;

  const images: Array<ImageInfo> = yield select(imagesSelector);

  const newImages = [...images];
  const index: number = newImages.findIndex((item) => item.id === payload.imageId);
  if (index > -1) {
    newImages.splice(index, 1);
    saveImages({ lessonId: payload.lessonId, images: newImages });
  }
}

function* searchImageSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    yield put({ type: SET_SEARCH_RESULT, payload: null });
    const result: Array<ImageDbInfo> = yield call(search, payload);
    console.log(result);
    yield put({ type: SET_SEARCH_RESULT, payload: result });
    yield put({ type: STOP_FETCHING });
  } catch (e: any) {
    yield put({ type: STOP_FETCHING });
    yield put(showError({ content: e.message }));
  }
}

// eslint-disable-next-line func-names
export const saga = function* () {
  yield all([
    takeEvery(GET_IMAGES_REQUEST, getImagesSaga),
    takeEvery(SAVE_IMAGES_REQUEST, saveImagesSaga),
    takeEvery(CLEAR_IMAGES_REQUEST, clearImagesSaga),
    takeEvery(DELETE_IMAGE_REQUEST, deleteImageSaga),
    takeEvery(SEARCH_IMAGE_REQUEST, searchImageSaga),
  ]);
};
