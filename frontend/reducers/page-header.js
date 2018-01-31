import {
    SHOW_SEARCH_FORM,
    HIDE_SEARCH_FORM,
    SHOW_FILTERS_FORM,
    HIDE_FILTER_FORM,
} from '../constants/page-header'

const initialState = {
    showSearchForm: false,
    showFiltersForm : false,
};

export default function pageHeader(state = initialState, action) {

    switch (action.type) {
        case SHOW_SEARCH_FORM:
            return {...state, showSearchForm: true};

        case HIDE_SEARCH_FORM:
            return {...state, showSearchForm: false};

        case SHOW_FILTERS_FORM:
            return {...state, showFiltersForm: true};

        case HIDE_FILTER_FORM:
            return {...state, showFiltersForm: false};

        default:
            return state;
    }

}