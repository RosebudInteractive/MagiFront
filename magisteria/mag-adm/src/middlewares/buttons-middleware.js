import {
    GET_SINGLE_COURSE_REQUEST,
    GET_SINGLE_COURSE_SUCCESS,
    GET_SINGLE_COURSE_FAIL,
    SAVE_COURSE_START,
    SAVE_COURSE_SUCCESS,
    SAVE_COURSE_FAIL,
    CHANGE_COURSE_DATA,
} from "../constants/course/singleCourse";
import {
    disableButtons,
    enableButtons,
} from "adm-ducks/app";
import {
    SAVE_PARAMETERS_FAIL,
    SAVE_PARAMETERS_START,
    SAVE_PARAMETERS_SUCCESS
} from "adm-ducks/params"

const ButtonsMiddleware = store => next => action => {

    switch (action.type) {
        case GET_SINGLE_COURSE_SUCCESS:
        case GET_SINGLE_COURSE_FAIL:
        case SAVE_COURSE_SUCCESS:
        case SAVE_COURSE_FAIL:
        case CHANGE_COURSE_DATA:
        case SAVE_PARAMETERS_SUCCESS:
        case SAVE_PARAMETERS_FAIL: {
            store.dispatch(enableButtons())
            return next(action)
        }

        case GET_SINGLE_COURSE_REQUEST:
        case SAVE_COURSE_START:
        case SAVE_PARAMETERS_START: {
            store.dispatch(disableButtons())
            return next(action)
        }

        default:
            return next(action)
    }
}


export default ButtonsMiddleware;