import {
    GET_AUTHORS_LIST_REQUEST,
    GET_AUTHORS_LIST_SUCCESS,
    GET_AUTHORS_LIST_FAIL,
    SELECT_AUTHOR,
    DELETE_AUTHOR_SUCCESS,
    SHOW_EDIT_AUTHOR_DLG,
    HIDE_EDIT_AUTHOR_DLG,
} from '../constants/authorsList'

import {
    EDIT_MODE_INSERT,
} from '../constants/Common'

const initialState = {
    authors: [],
    fetching: false,
    selected: null,
    editDlgShown: false,
    editMode: EDIT_MODE_INSERT
};

export default function authorsList(state = initialState, action) {

    switch (action.type) {
        case GET_AUTHORS_LIST_REQUEST:
            return { ...state, authors: [], fetching: true, hasError: false };

        case GET_AUTHORS_LIST_SUCCESS: {
            let _authors = action.payload;
            let _selected = (_authors.length > 0) ? _authors[0].id : null;

            return { ...state, authors: _authors, selected : _selected,
            fetching: false };
        }

        case GET_AUTHORS_LIST_FAIL:
            return initialState; //, hasError: true, message: action.payload };

        case SELECT_AUTHOR:
            return {...state, selected: action.payload};

        case DELETE_AUTHOR_SUCCESS: {
            let _authors = [];

            state.authors.forEach((author) => {
                if (author.id !== parseInt(action.payload)) {
                    _authors.push({...author})
                }
            });

            return {...state, authors: _authors}
        }

        case SHOW_EDIT_AUTHOR_DLG: {
            return {...state, editDlgShown: true, editMode: action.payload}
        }

        case HIDE_EDIT_AUTHOR_DLG: {
            let _authors = [];
            let _replaced = false;
            state.authors.forEach((author) => {
                if (author.id !== action.payload.id) {
                    _authors.push({...author})
                } else {
                    _authors.push(action.payload);
                    _replaced = true;
                }
            });

            if (!_replaced) {
                _authors.push(action.payload)
            }

            return {
                ...state,
                authors: _authors,
                editDlgShown: false,
                selected: _replaced ? state.selected : action.payload.id
            };
        }

        default:
            return state;
    }

}