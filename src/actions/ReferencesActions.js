import {
    CREATE_NEW_REFERENCE,
    EDIT_REFERENCE,
    CLEAR_REFERENCE,
} from '../constants/References'

export const createNewReference = (isRecommended) => {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_REFERENCE,
            payload: isRecommended
        });
    }
};

export const editReference = (object) => {
    return (dispatch) => {
        dispatch({
            type: EDIT_REFERENCE,
            payload: object
        });
    }
};

export const clearReference = () => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_REFERENCE,
            payload: null
        });
    }
};