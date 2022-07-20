import { createSelector } from 'reselect';
import { AnyAction } from 'redux';
import {
  all, call, put, take, takeEvery, race, select,
} from '@redux-saga/core/effects';
// @ts-ignore
import { commonGetQuery } from '#common/tools/fetch-tools';
import { appName } from '../config';
import { ImageDbInfo, ImageInfo, SearchResultItem } from '#types/images';
import {
  MODAL_MESSAGE_ACCEPT, MODAL_MESSAGE_DECLINE, showError, showUserConfirmation,
} from '#src/ducks/messages';
import {
  putRequest, deleteRequest, search, postRequest,
} from '#src/ducks/images-queries';
import type { Message } from '#types/messages';
import { convertDbImageInfo } from '#src/tools/images';
// import lessonImages from '#src/mock-data/lesson-images';

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

const ADD_IMAGE_REQUEST = `${prefix}/ADD_IMAGE_REQUEST`;
const SAVE_IMAGE_REQUEST = `${prefix}/SAVE_IMAGES_REQUEST`;
const DELETE_IMAGE_REQUEST = `${prefix}/DELETE_IMAGE_REQUEST`;

const SEARCH_IMAGE_REQUEST = `${prefix}/SEARCH_IMAGE_REQUEST`;
const SET_SEARCH_RESULT = `${prefix}/SET_SEARCH_RESULT`;

const CLEAR_IMAGES_REQUEST = `${prefix}/CLEAR_IMAGES_REQUEST`;
const CLEAR_IMAGES = `${prefix}/CLEAR_IMAGES`;

const SET_CURRENT_IMAGE = `${prefix}/SET_CURRENT_IMAGE`;

/**
 * Reducer
 * */
export interface ImagesReducer {
  fetching: boolean;
  images: Array<ImageInfo> | null;
  searchResult: Array<SearchResultItem> | null;
  error: string | null;
  current: ImageInfo | null;
}

export const initialState: ImagesReducer = {
  fetching: false,
  images: null,
  searchResult: null,
  error: null,
  current: null,
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

    case SET_CURRENT_IMAGE:
      return { ...state, current: payload };

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
export const currentSelector = createSelector(stateSelector,
  (state: ImagesReducer) => state.current);

/**
 * Action Creators
 * */
interface QueryOptions { lessonId?: number, taskId?: number }
interface SaveOptions extends QueryOptions{ image: ImageInfo }
interface DeleteOptions extends QueryOptions{ imageId: number }

export const getImages = (options: QueryOptions) => ({
  type: GET_IMAGES_REQUEST,
  payload: options,
});

export const clearImages = () => ({
  type: CLEAR_IMAGES_REQUEST,
});

export const addImage = (options: SaveOptions) => ({
  type: ADD_IMAGE_REQUEST,
  payload: options,
});

export const saveImage = (options: SaveOptions) => ({
  type: SAVE_IMAGE_REQUEST,
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

export const setCurrentImage = (image: ImageInfo | null) => ({
  type: SET_CURRENT_IMAGE,
  payload: image,
});

/**
 * Sagas
 */
function* getImagesSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    const dbImages: Array<ImageDbInfo> = yield call(commonGetQuery, `/api/pm/pictures?lessonId=${payload.lessonId}`);
    // const dbImages: Array<ImageDbInfo> = lessonImages;
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
    yield call(putRequest, payload.lessonId, payload.image);

    const images: Array<ImageInfo> = yield select(imagesSelector);
    const newImages = images.map((image) => (image.id === payload.image.id
      ? payload.image
      : image));

    yield put({ type: SET_IMAGES, payload: newImages });
    yield put({ type: STOP_FETCHING });
  } catch (e: any) {
    yield put({ type: STOP_FETCHING });
    yield put(showError({ content: e.message }));
  }
}

type Result = { id: number, result: string };

function* addImagesSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    const result: Result = yield call(postRequest, payload.lessonId, payload.image);

    yield put(getImages(payload));

    const { ok } = yield race({
      ok: take(SET_IMAGES),
      error: take(GET_IMAGES_FAIL),
    });

    if (!ok) return;

    const images: Array<ImageInfo> = yield select(imagesSelector);

    const current: ImageInfo | undefined = images.find((item) => item.id === result.id);
    if (current) yield put(setCurrentImage(current));
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

  const index: number = images.findIndex((item) => item.id === payload.imageId);

  yield put({ type: START_FETCHING });
  try {
    yield call(deleteRequest, payload.lessonId, payload.imageId);
    if (index > -1) {
      images.splice(index, 1);
      yield put({ type: SET_IMAGES, payload: images });
    }
    yield put({ type: STOP_FETCHING });
  } catch (e: any) {
    yield put({ type: STOP_FETCHING });
    yield put(showError({ content: e.message }));
  }
}

function* searchImageSaga({ payload }: any) {
  yield put({ type: START_FETCHING });
  try {
    yield put({ type: SET_SEARCH_RESULT, payload: null });
    const result: Array<SearchResultItem> = yield call(search, payload);
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
    takeEvery(ADD_IMAGE_REQUEST, addImagesSaga),
    takeEvery(SAVE_IMAGE_REQUEST, saveImagesSaga),
    takeEvery(CLEAR_IMAGES_REQUEST, clearImagesSaga),
    takeEvery(DELETE_IMAGE_REQUEST, deleteImageSaga),
    takeEvery(SEARCH_IMAGE_REQUEST, searchImageSaga),
  ]);
};
