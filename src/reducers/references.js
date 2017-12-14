import {
    CREATE_NEW_REFERENCE,
    EDIT_REFERENCE,
    CLEAR_REFERENCE,
} from '../constants/References'

const initialState = {
    reference: null,
    hasChanges: false,
    showEditor: false,
};


export default function reference(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_REFERENCE:{
            let _ref = {};
            _ref.Recommended = action.payload;

            return {
                ...state,
                reference: _ref,
                hasChanges: false,
                showEditor: true,
            };
        }


        case EDIT_REFERENCE:
            return {
                ...state,
                reference: action.payload,
                hasChanges: false,
                showEditor: true,
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