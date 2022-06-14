export default function reducer(state: import("immutable").Map<string, any> | undefined, action: any): import("immutable").Map<string, any>;
/**
 * Constants
 * */
export const moduleName: "dictionary";
export const LOAD_ALL: string;
export const REQUEST_START: string;
export const REQUEST_SUCCESS: string;
export const REQUEST_FAIL: string;
export const REQUEST_FAIL_WITH_ERROR: string;
export const TOGGLE_FETCHING: string;
export const UsersRecord: Record.Class;
export const ReducerRecord: Record.Class;
export const nextTimeSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const dictionaryFetching: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const lessonsSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const coursesSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const allCoursesSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const allUsersDSelector: import("reselect").OutputSelector<any, any[], (res: any) => any[]>;
export const availableForCreationLessons: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const userWithSupervisorRightsSelector: import("reselect").OutputSelector<any, any[], (res: any) => any[]>;
export const componentOwnersSelector: import("reselect").OutputSelector<any, any[], (res: any) => any[]>;
export function getAllDictionaryData(forceLoad?: boolean): {
    type: string;
    payload: {
        forceLoad: boolean;
    };
};
export function getAllUsers(forceLoad?: boolean): {
    type: string;
    payload: {
        forceLoad: boolean;
    };
};
export function getAllLessons(forceLoad?: boolean, checkSupervisorRights?: boolean): {
    type: string;
    payload: {
        forceLoad: boolean;
        checkSupervisorRights: boolean;
    };
};
export function toggleFetching(isOn: any): {
    type: string;
    payload: any;
};
export function saga(): Generator<import("@redux-saga/core/effects").AllEffect<import("@redux-saga/core/effects").ForkEffect<never>>, void, unknown>;
import { Record } from "immutable";
//# sourceMappingURL=dictionary.d.ts.map