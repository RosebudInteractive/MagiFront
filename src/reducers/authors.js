import {
    GET_AUTHORS_REQUEST,
    GET_AUTHORS_SUCCESS,
    GET_AUTHORS_FAIL,
    SELECT_AUTHOR,
    // SELECT_EPISODE,
    // SHOW_DELETE_DLG,
    // SHOW_ERROR_DIALOG,
    // DELETE_EPISODE_SUCCESS,
    // HIDE_ERROR_DIALOG,
    // HIDE_DELETE_DLG,
    // SHOW_EDIT_DLG,
    // HIDE_EDIT_DLG,
    // EDIT_MODE_INSERT
} from '../constants/Authors'

import {
    // SHOW_ERROR_DIALOG,
    // HIDE_ERROR_DIALOG,
    SHOW_DELETE_DLG,
    HIDE_DELETE_DLG,
    SHOW_EDIT_DLG,
    HIDE_EDIT_DLG,
    EDIT_MODE_INSERT,
} from '../constants/Common'

const initialState = {
    authors: [],
    fetching: false,
    hasError: false,
    message: null,
    selected: null,
    deleteDlgShown: false,
    errorDlgShown: false,
    editDlgShown: false,
    editMode: EDIT_MODE_INSERT
};

export default function episodes(state = initialState, action) {

    switch (action.type) {
        case GET_AUTHORS_REQUEST:
            return { ...state, authors: [], fetching: true, hasError: false };

        case GET_AUTHORS_SUCCESS:
            return { ...state, authors: action.payload, fetching: false };

        case GET_AUTHORS_FAIL:
            return { ...state, authors: [], fetching: false, hasError: true, message: action.payload };

        case SELECT_AUTHOR:
            return {...state, selected: action.payload};

        case SHOW_DELETE_DLG:
            return {...state, deleteDlgShown: true}
        case HIDE_DELETE_DLG:
            return {...state, deleteDlgShown: false}
        //
        // case DELETE_EPISODE_SUCCESS:
        //     var newEpisodes = []
        //     for (var i in state.episodes) {
        //         if (state.episodes[i].id != action.payload)
        //             newEpisodes.push({...state.episodes[i]})
        //     }
        //     return {...state, episodes: newEpisodes, deleteDlgShown: false}
        //
        // case SHOW_ERROR_DIALOG:
        //     return {...state,
        //         errorDlgShown: true,
        //         deleteDlgShown: false,
        //         message: action.payload,
        //         editDlgShown: false
        //     }
        // case HIDE_ERROR_DIALOG:
        //     return {...state, errorDlgShown: false, message: null}
        //
        case SHOW_EDIT_DLG:
            return {...state, editDlgShown: true, editMode: action.payload};

        case HIDE_EDIT_DLG: {
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