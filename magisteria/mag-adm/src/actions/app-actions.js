import {
    SHOW_ERROR_DIALOG,
} from '../constants/Common';

export const showErrorDialog = (message) => {
    return {
        type: SHOW_ERROR_DIALOG,
        payload: message
    }
};

