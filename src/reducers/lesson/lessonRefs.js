import {
    SELECT_COMMON_REFERENCE,
    SELECT_RECOMMENDED_REFERENCE,

} from '../../constants/lesson/singleLesson'

const initialState = {
    commonSelected: null,
    recommendedSelected : null,
};

export default function lessonEpisodes(state = initialState, action) {

    switch (action.type) {
        case SELECT_COMMON_REFERENCE : {
            return { ...state, commonSelected: action.payload}
        }

        case SELECT_RECOMMENDED_REFERENCE : {
            return { ...state, recommendedSelected: action.payload}
        }

        default:
            return state;
    }
}