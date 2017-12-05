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
    // HIDE_DELETE_DLG,
    SHOW_EDIT_DLG,
    // HIDE_EDIT_DLG,
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

        // case SHOW_DELETE_DLG:
        //     return {...state, deleteDlgShown: true}
        // case HIDE_DELETE_DLG:
        //     return {...state, deleteDlgShown: false}
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

        // case HIDE_EDIT_DLG:
        //     var newEpisodes2 = []
        //     var replaced = false
        //     for (var i2 in state.episodes) {
        //         if (state.episodes[i2].id != action.payload.id)
        //             newEpisodes2.push({...state.episodes[i2]})
        //         else {
        //             newEpisodes2.push(action.payload)
        //             replaced = true
        //         }
        //     }
        //     if (!replaced) {
        //         newEpisodes2.push(action.payload)
        //     }
        //     return {...state,
        //         episodes: newEpisodes2,
        //         editDlgShown: false,
        //         selected: replaced ? state.selected : action.payload.id
        //     }

        default:
            return state;
    }

}