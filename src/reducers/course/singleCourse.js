import {
    CREATE_NEW_COURSE,
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    CHANGE_COURSE_DATA,
    CANCEL_CHANGE_COURSE_DATA,
    CLEAR_COURSE,
    SAVE_COURSE_START,
    SAVE_COURSE_SUCCESS,
    SAVE_COURSE_FAIL,
} from '../../constants/course/singleCourse'

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges: false,
};

export default function singleCourse(state = initialState, action) {

    switch (action.type) {

        case CREATE_NEW_COURSE: {
            let _newObject = {
                State: 'D',
            };

            return {
                ...state,
                initial: _newObject,
                current: Object.assign({}, _newObject),
                fetching: false,
                hasChanges: false,
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
                hasChanges: false,
            };

        case GET_SINGLE_COURSE_FAIL:
            return {
                ...state, initial: null,
                current: null,
                fetching: false,
                hasChanges: false,
            };

        case SAVE_COURSE_START : {
            return {...state, fetching: true,}
        }

        case SAVE_COURSE_SUCCESS : {
            let _id = action.payload.id ? action.payload.id : state.current.id;
            state.current.id = _id;
            state.current.Id = _id;

            return {
                ...state,
                initial: Object.assign({}, state.current),
                fetching: false,
                hasChanges: false,
            };
        }

        case SAVE_COURSE_FAIL : {
            return {...state, fetching: false,}
        }

        case CLEAR_COURSE: {
            return {
                ...state, initial: null,
                current: null,
                fetching: true,
                hasChanges: false,
            }
        }

        case CHANGE_COURSE_DATA : {
            let _course = Object.assign({}, action.payload);

            return {...state, current: _course, hasChanges: true};
        }

        case CANCEL_CHANGE_COURSE_DATA: {
            return {
                ...state,
                current: Object.assign({}, state.initial),
                hasChanges: false,
            };
        }

        default:
            return state;
    }

}