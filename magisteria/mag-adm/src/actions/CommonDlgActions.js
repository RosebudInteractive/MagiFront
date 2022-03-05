import {
    SHOW_DELETE_DLG,
    HIDE_ERROR_DIALOG,
    HIDE_DELETE_DLG,
} from '../constants/Common';

export const showDeleteConfirmation = () => {
    return {
        type: SHOW_DELETE_DLG,
        payload: null
    }
};

export const cancelDelete = () => {
    return {
        type: HIDE_DELETE_DLG,
        payload: null
    }
};

export const confirmError = () => {
    return {
        type: HIDE_ERROR_DIALOG,
        payload: null
    }
};