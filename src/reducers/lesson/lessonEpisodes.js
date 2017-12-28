import {
    SELECT_MAIN_EPISODE,
    SELECT_SUPP_EPISODE,

} from '../../constants/SingleLesson'

const initialState = {
    mainSelected: null,
    suppSelected : null,
};

export default function lessonEpisodes(state = initialState, action) {

    switch (action.type) {
        case SELECT_MAIN_EPISODE : {
            return { ...state, mainSelected: action.payload}
        }

        case SELECT_SUPP_EPISODE : {
            return { ...state, suppSelected: action.payload}
        }

        default:
            return state;
    }
}