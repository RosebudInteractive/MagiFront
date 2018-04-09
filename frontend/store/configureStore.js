const NODE_ENV = process.env.NODE_ENV || 'prod';

import {createStore, applyMiddleware, compose} from 'redux'
import rootReducer from '../reducers';

import {createLogger} from 'redux-logger';
import thunk from 'redux-thunk';
import {routerMiddleware} from 'react-router-redux'
import history from '../history'
import playerMiddleware from './player-middleware';
import loaderMiddleware from './loader-middleware';
import LessonInfoStorageMiddleware from './lesson-info-storage-middleware';

export const store = configureStore();

function configureStore(initialState) {
    const logger = NODE_ENV === 'development' ? createLogger() : null;
    const routerMiddl = routerMiddleware(history);

    const store = (NODE_ENV === 'development') ?
        createStore(
            rootReducer,
            initialState,
            compose(
                // responsiveStoreEnhancer,
                applyMiddleware(thunk, logger),
                applyMiddleware(routerMiddl),
                applyMiddleware(playerMiddleware),
                applyMiddleware(loaderMiddleware),
                applyMiddleware(LessonInfoStorageMiddleware),
            )
        ) :
        createStore(
            rootReducer,
            initialState,
            compose(
                applyMiddleware(thunk),
                applyMiddleware(routerMiddl),
                applyMiddleware(playerMiddleware),
                applyMiddleware(loaderMiddleware),
                applyMiddleware(LessonInfoStorageMiddleware),
            )
        );

    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers');
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}
