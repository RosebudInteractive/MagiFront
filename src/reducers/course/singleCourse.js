import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    CHANGE_COURSE_DATA,
    CANCEL_CHANGE_COURSE_DATA,
    CLEAR_COURSE,
    SAVE_COURSE_DATA,
} from '../../constants/course/singleCourse'

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges : false,
};

export default function singleCourse(state = initialState, action) {

    switch (action.type) {

        case CREATE_NEW_COURSE: {
            let _newObject = {
                ColorHex: '#FFFFFF',
                State:'D',
            };

            return {
                ...state,
                initial: _newObject,
                current: Object.assign({}, _newObject),
                fetching: false,
                hasChanges : false,
            };
        }

        case GET_SINGLE_COURSE_REQUEST:
            return {
                ...state,
                initial: null,
                current: null,
                fetching: true,
                hasChanges: false,
            };

        case GET_SINGLE_COURSE_SUCCESS:
            return {
                ...state,
                initial: action.payload,
                current: Object.assign({}, action.payload),
                fetching: false,
                hasChanges : false,
            };

        case GET_SINGLE_COURSE_FAIL:
            return initialState;

        case SAVE_COURSE_DATA : {
            state.current.id = action.payload.id;
            state.current.Id = action.payload.id;

            return {
                ...state,
                initial: Object.assign({}, state.current),
                fetching: false,
                hasChanges : false,
            };
        }

        case CLEAR_COURSE:{
            return initialState
        }

        case CHANGE_COURSE_DATA : {
            let _course = Object.assign({}, action.payload);

            return {...state, current: _course, hasChanges: true };
        }

        case CANCEL_CHANGE_COURSE_DATA: {
            return {
                ...state,
                current: Object.assign({},state.initial),
                hasChanges : false,
            };
        }

        default:
            return state;
    }

}