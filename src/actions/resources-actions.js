import {
    CREATE_RESOURCE,
    EDIT_RESOURCE,
    CLEAR_RESOURCE,
    MULTI_UPLOAD_RESOURCES_START,
    MULTI_UPLOAD_RESOURCES_CANCEL,
    MULTI_UPLOAD_RESOURCES_FINISH, SELECT_SN_IMAGE_START, SELECT_SN_IMAGE_FINISH,
} from '../constants/lesson/lessonResources';

export const create = () => {
    return {
        type: CREATE_RESOURCE,
        payload: null
    }
};

export const multiUpload = () => {
    return {
        type: MULTI_UPLOAD_RESOURCES_START,
        payload: null
    }
};

export const cancelUpload = () => {
    return {
        type: MULTI_UPLOAD_RESOURCES_CANCEL,
        payload: null
    }
};

export const finishUpload = () => {
    return {
        type: MULTI_UPLOAD_RESOURCES_FINISH,
        payload: null
    }
};

export const selectSnImageStart = () => {
    return {
        type: SELECT_SN_IMAGE_START,
        payload: null
    }
}

export const selectSnImageFinish = () => {
    return {
        type: SELECT_SN_IMAGE_FINISH,
        payload: null
    }
}

export const edit = (value) => {
    return (dispatch) => {
        dispatch({
            type: EDIT_RESOURCE,
            payload: value
        });
    }
};

export const clear = (value) => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_RESOURCE,
            payload: value
        });
    }
};