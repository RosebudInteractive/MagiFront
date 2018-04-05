import {
    CREATE_EPISODE_CONTENT,
    EDIT_EPISODE_CONTENT,
    CLEAR_EPISODE_CONTENT,
} from '../constants/episode/episode-сontents'

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


export default function content(state = initialState, action) {

    switch (action.type) {
        case CREATE_EPISODE_CONTENT: {
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


        case EDIT_EPISODE_CONTENT:
            return {
                ...state,
                object: action.payload,
                hasChanges: false,
                showEditor: true,
                editMode: EDIT_MODE_EDIT,
            };

        case CLEAR_EPISODE_CONTENT:
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