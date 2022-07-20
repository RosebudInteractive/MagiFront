import type { ImageInfo } from '#types/images';
// @ts-ignore
import { checkStatus, parseJSON } from '#common/tools/fetch-tools';
import { convertImageInfoToDb, convertSearchResult } from '#src/tools/images';

export const postRequest = (lessonId: number, image: ImageInfo) => fetch(`/api/pm/pictures?lessonId=${lessonId}`, {
  method: 'POST',
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify(convertImageInfoToDb(image)),
  credentials: 'include',
}).then(checkStatus)
  .then(parseJSON);

export const putRequest = (lessonId: number, image: ImageInfo) => fetch(`/api/pm/pictures/${image.id}?lessonId=${lessonId}`, {
  method: 'PUT',
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify(convertImageInfoToDb(image)),
  credentials: 'include',
}).then(checkStatus)
  .then(parseJSON);

export const deleteRequest = (lessonId: number, imageId: number) => fetch(`/api/pm/pictures/${imageId}?lessonId=${lessonId}`, {
  method: 'DELETE',
  headers: {
    'Content-type': 'application/json',
  },
  credentials: 'include',
}).then(checkStatus)
  .then(parseJSON);

export const search = (searchValue: string) => fetch('/api/search', {
  method: 'POST',
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify({
    index: {
      picture: true,
    },
    withCount: true,
    query: searchValue,
  }),
  credentials: 'include',
}).then(checkStatus)
  .then(parseJSON)
  .then((result: any) => convertSearchResult(result));

// export const search = () => Promise.resolve(convertSearchResult({ hits: [], count: 0 }));
