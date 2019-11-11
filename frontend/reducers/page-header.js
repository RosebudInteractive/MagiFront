import {
    SHOW_SEARCH_FORM,
    HIDE_SEARCH_FORM,
    SHOW_FILTERS_FORM,
    HIDE_FILTER_FORM,
    SHOW_MENU,
    HIDE_MENU,
    SET_CURRENT_PAGE,
} from '../constants/page-header';

import {pages} from '../tools/page-tools';

const initialState = {
    showSearchForm: false,
    showFiltersForm: false,
    showMenu: false,
    courseUrl: null,
    lessonUrl: null,
    currentPage: pages.courses,
    visibility: true,
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

        case SET_CURRENT_PAGE : {
            return {...state,
                currentPage: action.payload.page,
                courseUrl: action.payload.courseUrl,
                lessonUrl: action.payload.lessonUrl,
                visibility: !((action.payload.page === pages.lesson) || (action.payload.page === pages.player) || (action.payload.page === pages.test))
            };
        }

        default:
            return state;
    }

}