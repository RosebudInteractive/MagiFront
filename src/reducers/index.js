import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';

import page from "./page"
import user from "./user"
import commonDlg from './commonDlg';
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
import appReducer, {moduleName as appModule} from '../ducks/app'
import authReducer, {moduleName as authModule} from '../ducks/auth'
import paramsReducer, {moduleName as paramsModule} from '../ducks/params'
import booksReducer, {moduleName as booksModule} from '../ducks/books'
import promosReducer, {moduleName as promosModule} from '../ducks/promo-codes'
import productsReducer, {moduleName as productsModule} from '../ducks/products'
import messagesReducer, {moduleName as messagesModule} from '../ducks/messages'
import { reducer as formReducer } from 'redux-form'

export default combineReducers({
    page,
    user,
    commonDlg,
    author,
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
    [appModule]: appReducer,
    [authModule]: authReducer,
    [paramsModule]: paramsReducer,
    [booksModule]: booksReducer,
    [promosModule]: promosReducer,
    [productsModule]: productsReducer,
    [messagesModule]: messagesReducer,
    routing: routerReducer,
    form: formReducer,
})
