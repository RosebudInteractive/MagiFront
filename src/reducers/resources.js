import {
    CREATE_RESOURCE,
    EDIT_RESOURCE,
    CLEAR_RESOURCE,
} from '../constants/resources'

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


export default function resources(state = initialState, action) {

    switch (action.type) {
        case CREATE_RESOURCE:{
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


        case EDIT_RESOURCE:
            return {
                ...state,
                object: action.payload,
                hasChanges: false,
                showEditor: true,
                editMode: EDIT_MODE_EDIT,
            };

        case CLEAR_RESOURCE:
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