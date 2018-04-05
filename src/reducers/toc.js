import {
    CREATE_TOC,
    EDIT_TOC,
    CLEAR_TOC,
} from '../constants/episode/episode-tocs'

import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common'

const initialState = {
    object: null,
    hasChanges: false,
    showEditor: false,
    internalId: -1,
    editMode: EDIT_MODE_INSERT,
};


export default function toc(state = initialState, action) {

    switch (action.type) {
        case CREATE_TOC:{
            let _obj = {};
            _obj.Id = state.internalId;

            return {
                ...state,
                object: _obj,
                hasChanges: false,
                showEditor: true,
                internalId: --state.internalId,
                editMode: EDIT_MODE_INSERT,
            };
        }


        case EDIT_TOC:
            return {
                ...state,
                object: action.payload,
                hasChanges: false,
                showEditor: true,
                editMode: EDIT_MODE_EDIT,
            };

        case CLEAR_TOC:
            return {
                ...state,
                object: null,
                hasChanges: false,
                showEditor: false,
            };

        default:
            return state;
    }

}