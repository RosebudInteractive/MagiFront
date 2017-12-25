import {
    GET_CATEGORIES_REQUEST,
    GET_CATEGORIES_SUCCESS,
    GET_CATEGORIES_FAIL,
    SELECT_CATEGORY,
    DELETE_CATEGORY_SUCCESS,
    SHOW_EDIT_CATEGORY_DLG,
    HIDE_EDIT_CATEGORY_DLG,
} from '../constants/Categories'

import {
    EDIT_MODE_INSERT,
} from '../constants/Common'

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
            let _data = [];

            state.categories.forEach((category) => {
                if (category.id !== action.payload) {
                    _data.push({...category})
                }
            });

            return {...state, categories: _data}
        }

        case SHOW_EDIT_CATEGORY_DLG: {
            return {...state, editDlgShown: true, editMode: action.payload}
        }

        case HIDE_EDIT_CATEGORY_DLG: {
            let _data = [];
            let _replaced = false;
            state.categories.forEach((category) => {
                if (category.id !== action.payload.id) {
                    _data.push({...category})
                } else {
                    _data.push(action.payload);
                    _replaced = true;
                }
            });

            if (!_replaced) {
                _data.push(action.payload)
            }

            return {
                ...state,
                categories: _data,
                editDlgShown: false,
                selected: _replaced ? state.selected : action.payload.id
            };
        }

        default:
            return state;
    }

}