import {SAVE_COURSE_SUCCESS,} from "../constants/course/singleCourse";
import {SAVE_LESSON_SUCCESS} from "../constants/lesson/singleLesson";

import {saveParameters} from "adm-ducks/params";
import {store} from '../redux/configureStore';

const ParamsMiddleware = store => next => action => {

    switch (action.type) {
        case SAVE_COURSE_SUCCESS:
        case SAVE_LESSON_SUCCESS: {
            Saver.getInstance().saveParameters(action.payload)
            return next(action)
        }

        default:
            return next(action)
    }
}


let _instance = null;

class Saver {

    static getInstance() {
        if (!_instance) {
            _instance = new Saver()
        }

        return _instance
    }

    saveParameters(data) {
        store.dispatch(saveParameters(data));
    }
}

export default ParamsMiddleware;

