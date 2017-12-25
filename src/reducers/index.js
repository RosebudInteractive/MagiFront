import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';

import page from "./page"
import user from "./user"
import menu from "./menu"
import commonDlg from './commonDlg';
import episodes from "./episodes";
import author from './author';
import authorsList from './authorsList';
import categories from './categoriesList';
import courses from './courses';
import singleCourse from './singleCourse';
import singleLesson from './singleLesson';
import languages from './languages';
import courseAuthors from './courseAuthors';
import courseCategories from './courseCategories';
import courseLessons from './courseLessons';
import singleEpisode from './singleEpisode';
import references from './references';
import lessonEpisodes from './lessonEpisodes';
import lessonRefs from './lessonRefs';

export default combineReducers({
    page,
    user,
    menu,
    commonDlg,
    author,
    episodes,
    languages,
    authorsList,
    categories,
    courses,
    singleCourse,
    courseAuthors,
    courseCategories,
    courseLessons,
    singleLesson,
    references,
    singleEpisode,
    lessonEpisodes,
    lessonRefs,
    routing: routerReducer,
})
