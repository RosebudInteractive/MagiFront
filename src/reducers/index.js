import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';

import page from "./page"
import user from "./user"
import menu from "./menu"
import commonDlg from './commonDlg';
import episodes from "./episodes";
import author from './author';
import authorsList from './authorsList';
import category from './category';
import categoriesList from './categoriesList';
// Course
import courses from './courses';
import singleCourse from './course/singleCourse';
import courseAuthors from './course/courseAuthors';
import courseCategories from './course/courseCategories';
import courseLessons from './course/courseLessons';
// Lesson
import singleLesson from './lesson/singleLesson';
import subLessons from './lesson/subLessons';
import lessonResources from './lesson/lessonResources';
import lessonEpisodes from './lesson/lessonEpisodes';
import lessonRefs from './lesson/lessonRefs';
// Episode
import singleEpisode from './episode/singleEpisode';
import episodeToc from './episode/episodeToc';
import episodeContent from './episode/episodeContent';
// Common
import languages from './languages';
import references from './references';

export default combineReducers({
    page,
    user,
    menu,
    commonDlg,
    author,
    episodes,
    languages,
    authorsList,
    category,
    categoriesList,
    courses,
    singleCourse,
    courseAuthors,
    courseCategories,
    courseLessons,
    singleLesson,
    subLessons,
    lessonResources,
    references,
    singleEpisode,
    lessonEpisodes,
    lessonRefs,
    episodeToc,
    episodeContent,
    routing: routerReducer,
})
