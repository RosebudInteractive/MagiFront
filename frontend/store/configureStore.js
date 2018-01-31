import {createStore, applyMiddleware, compose} from 'redux'
import rootReducer from '../reducers'
import {createLogger} from 'redux-logger'
import thunk from 'redux-thunk';
// import {responsiveStoreEnhancer} from 'redux-responsive'
// import { routerMiddleware } from 'react-router-redux'

export const store = configureStore();

function configureStore(initialState) {
    const logger = createLogger();
    // const routerMiddl = routerMiddleware(history);

    const store = createStore(
        rootReducer,
        initialState,
        compose(
            // responsiveStoreEnhancer,
            applyMiddleware(thunk, logger),
            // applyMiddleware(routerMiddl)
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
