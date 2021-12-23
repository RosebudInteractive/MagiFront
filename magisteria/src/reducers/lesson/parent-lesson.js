import {
    SET_PARENT_LESSON,
    CLEAR_PARENT_LESSON, LOAD_PARENT_LESSON_START, LOAD_PARENT_LESSON_SUCCESS, LOAD_PARENT_LESSON_FAIL,
} from '../../constants/lesson/singleLesson'

const initialState = {
    id: null,
    name: null,
    loading: false,
};

export default function parentLesson(state = initialState, action) {

    switch (action.type) {
        case SET_PARENT_LESSON: {
            return {
                ...state,
                id: action.payload.id,
                name: action.payload.name,
            };
        }

        case CLEAR_PARENT_LESSON: {
            return {
                ...state, id: null,
                name: null,
            }
        }

        case LOAD_PARENT_LESSON_START: {
            return {...state, loading: true}
        }

        case LOAD_PARENT_LESSON_SUCCESS: {
            return {
                ...state,
                id: action.payload.id,
                name: action.payload.name,
                loading: false,
            };
        }

        case LOAD_PARENT_LESSON_FAIL: {
            return {...state, loading: false}
        }


        default:
            return state;
    }

}