import {
    CREATE_NEW_LESSON,
    GET_SINGLE_LESSON_REQUEST,
    GET_SINGLE_LESSON_SUCCESS,
    GET_SINGLE_LESSON_FAIL,
    CHANGE_LESSON_DATA,
    CANCEL_CHANGE_LESSON_DATA,
    SAVE_LESSON_SUCCESS,
    CLEAR_LESSON,
} from '../../constants/lesson/singleLesson'

const initialState = {
    initial: null,
    current: null,
    fetching: false,
    hasChanges: false,
};

export default function singleLesson(state = initialState, action) {

    switch (action.type) {
        case CREATE_NEW_LESSON: {
            let _newObject = {
                CourseId: action.payload.CourseId,
                CourseName: action.payload.CourseName,
                Number: action.payload.Number,
                State: 'D',
                LessonType: action.payload.LessonType,
                CurrParentName: action.payload.CurrParentName,
                CurrParentId: action.payload.CurrParentId,
            };

            return {
                ...state,
                initial: _newObject,
                current: Object.assign({}, _newObject),
                fetching: false,
                hasChanges: false,
            };
        }

        case GET_SINGLE_LESSON_REQUEST:
            return {
                ...state,
                initial: null,
                current: null,
                fetching: true,
                hasChanges: false,
            };

        case GET_SINGLE_LESSON_SUCCESS: {
            return {
                ...state,
                initial: action.payload,
                current: Object.assign({}, action.payload),
                fetching: false,
                hasChanges: false,
            };

        }

        case GET_SINGLE_LESSON_FAIL:
            return {...state, initial: null,
                current: null,
                fetching: false,
                hasChanges: false,};

        case SAVE_LESSON_SUCCESS: {
            let _id = action.payload.id ? action.payload.id : state.current.id;
            state.current.id = _id;
            state.current.Id = _id;

            let _newInitialLesson = Object.assign({}, state.current);

            return {
                ...state,
                initialLesson: _newInitialLesson,
                fetching: false,
                hasChanges: false,
            };
        }

        case CHANGE_LESSON_DATA : {
            let _object = Object.assign({}, action.payload);

            return {...state, current: _object, hasChanges: true};
        }

        case CANCEL_CHANGE_LESSON_DATA: {

            return {
                ...state,
                current: Object.assign({}, state.initial),
                fetching: false,
                hasChanges: false,
            };
        }

        case CLEAR_LESSON: {
            return {...state, initial: null,
                current: null,
                fetching: true,
                hasChanges: false,}
        }

        default:
            return state;
    }

}