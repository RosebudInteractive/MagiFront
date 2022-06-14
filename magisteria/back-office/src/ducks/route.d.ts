export default function reducer(state: import("immutable").Map<string, any> | undefined, action: any): import("immutable").Map<string, any>;
/**
 * Constants
 * */
export const moduleName: "route";
/**
 * Reducer
 * */
export const ReducerRecord: Record.Class;
export const activeTaskIdSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const dashboardActiveRecordSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
export const paramsSelector: import("reselect").OutputSelector<any, string, (res: any) => string>;
export const filterSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
export function setPathname(path: string): {
    type: string;
    payload: string;
};
export function applyFilter(filter: any): {
    type: string;
    payload: any;
};
export function setGridSortOrder(order: GridSortOrder): {
    type: string;
    payload: GridSortOrder;
};
export function setGridSortOrderSilently(order: GridSortOrder): {
    type: string;
    payload: GridSortOrder;
};
export function setActiveTaskId(taskId: number): {
    type: string;
    payload: number;
};
export function setDashboardViewMode(viewMode: number): {
    type: string;
    payload: number;
};
export function setDashboardActiveRecord(recordId: number): {
    type: string;
    payload: number;
};
export function buildLocation(replace?: boolean): {
    type: string;
    payload: boolean;
};
export function setInitState(data: any): {
    type: string;
    payload: any;
};
export function clearLocationGuard(): {
    type: string;
};
export function saga(): Generator<import("@redux-saga/core/effects").AllEffect<import("@redux-saga/core/effects").ForkEffect<never>>, void, unknown>;
import { Record } from "immutable";
import { GridSortOrder } from "../types/grid";
//# sourceMappingURL=route.d.ts.map