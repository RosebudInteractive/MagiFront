import { AnyAction } from 'redux';
import { ImageInfo } from '#types/images';
/**
 * Constants
 * */
export declare const moduleName = "images";
/**
 * Reducer
 * */
export interface ImagesReducer {
    fetching: boolean;
    images: Array<ImageInfo> | null;
    error: string | null;
}
export declare const initialState: ImagesReducer;
export default function reducer(state: ImagesReducer | undefined, action: AnyAction): {
    images: any;
    fetching: boolean;
    error: string | null;
};
export declare const fetching: import("reselect").OutputSelector<any, boolean, (res: ImagesReducer) => boolean>;
export declare const imagesSelector: import("reselect").OutputSelector<any, ImageInfo[] | null, (res: ImagesReducer) => ImageInfo[] | null>;
/**
 * Action Creators
 * */
declare type QueryOptionsType = {
    lessonId?: number;
    taskId?: number;
};
export declare const getImages: (options: QueryOptionsType) => {
    type: string;
    payload: QueryOptionsType;
};
export declare const saga: () => Generator<import("@redux-saga/core/effects").AllEffect<import("@redux-saga/core/effects").ForkEffect<never>>, void, unknown>;
export {};
//# sourceMappingURL=images.d.ts.map