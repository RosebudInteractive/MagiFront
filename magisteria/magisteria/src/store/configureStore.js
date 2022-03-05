import rootSaga from "./saga";

const NODE_ENV = process.env.NODE_ENV || 'prod';

import {createStore, applyMiddleware, compose} from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import {routerMiddleware} from 'react-router-redux'
import history from '../history'
import playerMiddleware from './player-middleware';
import loaderMiddleware from './loader-middleware';
import LessonInfoStorageMiddleware from './lesson-info-storage-middleware';
import AudioLoaderMiddleware from './audio-loader-middleware';
import BookmarksMiddleware from './bookmarks-middleware';
import GoogleAnalyticsMiddleware from './google-analytics-middleware';
import AppOptionsMiddleware from './app-options-middleware';
import VersionMiddleware from './version-middleware';
import {attachStore} from "tools/course-discount";

export const store = configureStore();

attachStore(store)

function configureStore(initialState) {
    // const logger = NODE_ENV === 'development' ? createLogger() : null;
    const routerMiddl = routerMiddleware(history);
    const sagaMiddleware = createSagaMiddleware()

    const store = (NODE_ENV === 'development') ?
        createStore(
            rootReducer,
            initialState,
            compose(
                // responsiveStoreEnhancer,
                applyMiddleware(sagaMiddleware),
                applyMiddleware(thunk),
                applyMiddleware(routerMiddl),
                applyMiddleware(playerMiddleware),
                applyMiddleware(loaderMiddleware),
                applyMiddleware(LessonInfoStorageMiddleware),
                applyMiddleware(AudioLoaderMiddleware),
                applyMiddleware(BookmarksMiddleware),
                applyMiddleware(GoogleAnalyticsMiddleware),
                applyMiddleware(AppOptionsMiddleware),
                applyMiddleware(VersionMiddleware),
            )
        ) :
        createStore(
            rootReducer,
            initialState,
            compose(
                applyMiddleware(sagaMiddleware),
                applyMiddleware(thunk),
                applyMiddleware(routerMiddl),
                applyMiddleware(playerMiddleware),
                applyMiddleware(loaderMiddleware),
                applyMiddleware(LessonInfoStorageMiddleware),
                applyMiddleware(AudioLoaderMiddleware),
                applyMiddleware(BookmarksMiddleware),
                applyMiddleware(GoogleAnalyticsMiddleware),
                applyMiddleware(AppOptionsMiddleware),
                applyMiddleware(VersionMiddleware),
            )
        );

    sagaMiddleware.run(rootSaga)

    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers');
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}
