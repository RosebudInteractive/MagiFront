import {
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    SAVE_COURSE_START,
    SAVE_COURSE_SUCCESS,
    SAVE_COURSE_FAIL,
    CHANGE_COURSE_DATA,
} from "../constants/course/singleCourse";
import {disableButtons, enableButtons} from "adm-ducks/app";

const ButtonsMiddleware = store => next => action => {

    switch (action.type) {
        case GET_SINGLE_COURSE_SUCCESS:
        case GET_SINGLE_COURSE_FAIL:
        case SAVE_COURSE_SUCCESS:
        case SAVE_COURSE_FAIL:
        case CHANGE_COURSE_DATA: {
            store.dispatch(enableButtons())
            return next(action)
        }

        case GET_SINGLE_COURSE_REQUEST:
        case SAVE_COURSE_START: {
            store.dispatch(disableButtons())
            return next(action)
        }

        default:
            return next(action)
    }
}


export default ButtonsMiddleware;