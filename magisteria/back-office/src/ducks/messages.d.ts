export default function reducer(state: import("immutable").Map<string, any> | undefined, action: any): import("immutable").Map<string, any>;
/**
 * Constants
 * */
export const moduleName: "messages";
export const MODAL_MESSAGE_ACCEPT: string;
export const MODAL_MESSAGE_DECLINE: string;
export const ReducerRecord: Record.Class;
export function showErrorMessage(message: any): {
    type: string;
    payload: {
        content: any;
        title: string;
        type: string;
    };
};
export function showInfo(message: any): {
    type: string;
    payload: any;
};
export function showError(message: any): {
    type: string;
    payload: any;
};
export function showWarning(message: any): {
    type: string;
    payload: any;
};
export function showUserConfirmation(message: any): {
    type: string;
    payload: any;
};
export function acceptAction(): {
    type: string;
};
export function declineAction(): {
    type: string;
};
export function toggleMessage(visible: any): {
    type: string;
    payload: any;
};
export const messageSelector: import("reselect").OutputSelector<any, any, (res: any) => any>;
import { Record } from "immutable";
//# sourceMappingURL=messages.d.ts.map