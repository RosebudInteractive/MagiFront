import {
    GET_AUTHORS_LIST_REQUEST,
    GET_AUTHORS_LIST_SUCCESS,
    GET_AUTHORS_LIST_FAIL,
    SELECT_AUTHOR,
    DELETE_AUTHOR_SUCCESS,
} from '../constants/authorsList'

import {
    EDIT_MODE_INSERT,
} from '../constants/Common'

import * as tools from './tools';

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
            return initialState;

        case SELECT_AUTHOR:
            return {...state, selected: action.payload};

        case DELETE_AUTHOR_SUCCESS: {
            let _result = tools.deleteObject(state.authors, action.payload);

            return {...state, authors: _result.resultArray, selected : _result.selected}
        }

        default:
            return state;
    }

}