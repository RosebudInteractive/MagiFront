import {
    SHOW_ERROR_DIALOG,
    HIDE_ERROR_DIALOG,
    SHOW_DELETE_DLG,
    HIDE_DELETE_DLG,
} from '../constants/Common'

const initialState = {
    message: null,
    hasError: false,
    deleteDlgShown: false,
    errorDlgShown: false,
};

export default function commonDlg(state = initialState, action) {

    switch (action.type) {
        case SHOW_DELETE_DLG:
            return {...state, deleteDlgShown: true};

        case HIDE_DELETE_DLG:
            return {...state, deleteDlgShown: false};

        case SHOW_ERROR_DIALOG:
            return {
                ...state,
                errorDlgShown: true,
                deleteDlgShown: false,
                message: action.payload,
                editDlgShown: false
            };

        case HIDE_ERROR_DIALOG:
            return {...state, errorDlgShown: false, message: null};

        default:
            return state;
    }

}