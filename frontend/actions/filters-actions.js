import {
    CLEAR_FILTERS,
} from '../constants/filters'

export const clear = () => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_FILTERS,
            payload: null
        });
    }
};