import {
    CREATE_NEW_REFERENCE,
    EDIT_REFERENCE,
    CLEAR_REFERENCE,
} from '../constants/References'

import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common'

const initialState = {
    reference: null,
    hasChanges: false,
    showEditor: false,
    internalId: -1,
    editMode: EDIT_MODE_INSERT,
};


export default function reference(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_REFERENCE:{
            let _ref = {};
            _ref.Recommended = action.payload;
            _ref.Id = state.internalId;

            return {
                ...state,
                reference: _ref,
                hasChanges: false,
                showEditor: true,
                internalId: --state.internalId,
                editMode: EDIT_MODE_INSERT,
            };
        }


        case EDIT_REFERENCE:
            return {
                ...state,
                reference: action.payload,
                hasChanges: false,
                showEditor: true,
                editMode: EDIT_MODE_EDIT,
            };

        case CLEAR_REFERENCE:
            return {
                ...state, reference: null,
                hasChanges: false,
                showEditor: false,
            };

        default:
            return state;
    }

}