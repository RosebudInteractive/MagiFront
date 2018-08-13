import {
    CREATE_RESOURCE,
    EDIT_RESOURCE,
    CLEAR_RESOURCE,
    MULTI_UPLOAD_RESOURCES_START,
    MULTI_UPLOAD_RESOURCES_CANCEL,
    MULTI_UPLOAD_RESOURCES_FINISH,
} from '../constants/lesson/lessonResources';

import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT,
} from '../constants/Common'

const initialState = {
    object: null,
    hasChanges: false,
    showEditor: false,
    showMultiUploadEditor: false,
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

        case MULTI_UPLOAD_RESOURCES_START:{
            return {
                ...state,
                showMultiUploadEditor: true,
            };
        }

        case MULTI_UPLOAD_RESOURCES_CANCEL:{
            return {
                ...state,
                showMultiUploadEditor: false,
            };
        }

        case MULTI_UPLOAD_RESOURCES_FINISH:{
            return {
                ...state,
                showMultiUploadEditor: false,
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