import {
    GET_CATEGORIES_REQUEST,
    GET_CATEGORIES_SUCCESS,
    GET_CATEGORIES_FAIL,
    SELECT_CATEGORY,
    DELETE_CATEGORY_SUCCESS,
} from '../constants/categoriesList'

import {
    EDIT_MODE_INSERT,
} from '../constants/Common';

import * as tools from './tools';

const initialState = {
    categories: [],
    fetching: false,
    selected: null,
    editDlgShown: false,
    editMode: EDIT_MODE_INSERT
};

export default function categories(state = initialState, action) {

    switch (action.type) {
        case GET_CATEGORIES_REQUEST:
            return { ...state, categories: [], fetching: true, hasError: false };

        case GET_CATEGORIES_SUCCESS: {
            let _categories = action.payload;
            let _selected = (_categories.length > 0) ? _categories[0].id : null;

            return { ...state, categories: _categories, selected : _selected, fetching: false };
        }

        case GET_CATEGORIES_FAIL:
            return initialState;

        case SELECT_CATEGORY:
            return {...state, selected: action.payload};

        case DELETE_CATEGORY_SUCCESS: {
            let _result = tools.deleteObject(state.categories, action.payload);

            return {...state, categories: _result.resultArray, selected : _result.selected}
        }

        default:
            return state;
    }

}