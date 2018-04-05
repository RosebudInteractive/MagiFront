import {
    CLEAR_FILTERS,
    SWITCH_FILTERS,
} from '../constants/filters'

export const clear = () => {
    return (dispatch) => {
        dispatch({
            type: CLEAR_FILTERS,
            payload: null
        });
    }
};

export const switchFilter = (id) => {
    return (dispatch) => {
        dispatch({
            type: SWITCH_FILTERS,
            payload: id
        });
    }
}