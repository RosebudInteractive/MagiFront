import {
    SET_PARENT_LESSON,
    CLEAR_PARENT_LESSON,
} from '../../constants/lesson/singleLesson'

const initialState = {
    id: null,
    name: null,
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

        case CLEAR_PARENT_LESSON:{
            return initialState
        }

        default:
            return state;
    }

}