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
import courseAuthorsList from './course/courseAuthorsList';
// Lesson
import singleLesson from './lesson/singleLesson';
import subLessons from './lesson/subLessons';
import lessonResources from './lesson/lesson-resources';
import lessonMainEpisodes from './lesson/lessonMainEpisodes';
import lessonRecommendedRefs from './lesson/lessonRecommendedRefs';
import lessonCommonRefs from './lesson/lessonCommonRefs';
import parentLesson from './lesson/parent-lesson';
// Episode
import singleEpisode from './episode/singleEpisode';
import episodeToc from './episode/episodeToc';
import episodeContent from './episode/episodeContent';
// Common
import languages from './languages';
import references from './references';
import resources from './resources';
import toc from './toc';
import content from './content';
import workShop from './work-shop'
import authReducer, {moduleName as authModule} from '../ducks/auth'
import { reducer as formReducer } from 'redux-form'

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
    courseAuthorsList,
    courseCategories,
    courseLessons,
    singleLesson,
    subLessons,
    lessonResources,
    parentLesson,
    references,
    singleEpisode,
    lessonMainEpisodes,
    lessonRecommendedRefs,
    lessonCommonRefs,
    episodeToc,
    episodeContent,
    resources,
    toc,
    content,
    workShop,
    [authModule]: authReducer,
    routing: routerReducer,
    form: formReducer,
})
