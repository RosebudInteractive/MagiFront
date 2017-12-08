import {
    GET_AUTHORS_REQUEST,
    GET_AUTHORS_SUCCESS,
    GET_AUTHORS_FAIL,
    SELECT_AUTHOR,
    DELETE_AUTHOR_SUCCESS,
    SHOW_EDIT_AUTHOR_DLG,
    HIDE_EDIT_AUTHOR_DLG,
} from '../constants/Authors'

import {
    EDIT_MODE_INSERT,
} from '../constants/Common'

const initialState = {
    authors: [],
    fetching: false,
    // hasError: false,
    // message: null,
    selected: null,
    // deleteDlgShown: false,
    // errorDlgShown: false,
    editDlgShown: false,
    editMode: EDIT_MODE_INSERT
};

export default function authors(state = initialState, action) {

    switch (action.type) {
        case GET_AUTHORS_REQUEST:
            return { ...state, authors: [], fetching: true, hasError: false };

        case GET_AUTHORS_SUCCESS:
            return { ...state, authors: action.payload, fetching: false };

        case GET_AUTHORS_FAIL:
            return { ...state, authors: [], fetching: false}; //, hasError: true, message: action.payload };

        case SELECT_AUTHOR:
            return {...state, selected: action.payload};

        case DELETE_AUTHOR_SUCCESS: {
            let _authors = [];

            state.authors.forEach((author) => {
                if (author.id !== action.payload) {
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