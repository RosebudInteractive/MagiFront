import {
    SHOW_SEARCH_FORM,
    HIDE_SEARCH_FORM,
    SHOW_FILTERS_FORM,
    HIDE_FILTER_FORM,
    SHOW_MENU,
    HIDE_MENU,
} from '../constants/page-header'

const initialState = {
    showSearchForm: false,
    showFiltersForm: false,
    showMenu: false,
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

        case SHOW_MENU:
            return {...state, showMenu: true};

        case HIDE_MENU:
            return {...state, showMenu: false};

        default:
            return state;
    }

}