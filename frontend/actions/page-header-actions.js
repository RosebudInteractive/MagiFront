import {
    SHOW_SEARCH_FORM,
    HIDE_SEARCH_FORM,
    SHOW_FILTERS_FORM,
    HIDE_FILTER_FORM,
    SHOW_MENU,
    HIDE_MENU,
    SET_CURRENT_PAGE,
} from '../constants/page-header'

export const showSearchForm = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_SEARCH_FORM,
            payload: null
        });
    }
};

export const hideSearchForm = () => {
    return {
        type: HIDE_SEARCH_FORM,
        payload: null
    }
};

export const showFiltersForm = () => {
    return {
        type: SHOW_FILTERS_FORM,
        payload: null
    }
};

export const hideFiltersForm = () => {
    return {
        type: HIDE_FILTER_FORM,
        payload: null
    }
};

export const showMenu = () => {
    return (dispatch) => {
        dispatch({
            type: SHOW_MENU,
            payload: null
        });
    }
};

export const hideMenu = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_MENU,
            payload: null
        });
    }
};

export const setCurrentPage = (page, courseUrl, lessonUrl) => {
    return (dispatch) => {
        dispatch({
            type: SET_CURRENT_PAGE,
            payload: {page: page, courseUrl: courseUrl, lessonUrl: lessonUrl}
        });
    }
}

