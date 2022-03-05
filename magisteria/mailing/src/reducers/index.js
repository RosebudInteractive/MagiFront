import {combineReducers} from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form'
import singleCourse from 'reducers/singleCourse';
import CourseReducer, {moduleName as CourseModule} from 'ducks/course'

export default combineReducers({
    singleCourse,
    [CourseModule]: CourseReducer,
    routing: routerReducer,
    form: formReducer,
})
