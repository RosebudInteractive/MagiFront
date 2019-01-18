import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from '../reducers'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import workShopMiddleware from '../middlewares/work-shop-middleware'
import history from '../history'
import ButtonsMiddleware from './buttons-middleware'

export const store = configureStore();

function configureStore(initialState) {
    const logger = createLogger();
    const routerMiddl = routerMiddleware(history);

    const store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(thunk, logger),
            applyMiddleware(routerMiddl),
            applyMiddleware(workShopMiddleware),
            applyMiddleware(ButtonsMiddleware)
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
