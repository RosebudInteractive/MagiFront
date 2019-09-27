import {combineReducers} from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form'
import singleCourse from '../../frontend/reducers/singleCourse';

export default combineReducers({
    singleCourse,
    routing: routerReducer,
    form: formReducer,
})
