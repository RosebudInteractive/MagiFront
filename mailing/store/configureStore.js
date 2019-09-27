import {createStore, applyMiddleware, compose} from 'redux'
import rootReducer from '../reducers';

import thunk from 'redux-thunk';
import {routerMiddleware} from 'react-router-redux'
import history from '../history'

export const store = configureStore();

function configureStore(initialState) {
    const routerMiddl = routerMiddleware(history);

    const store = createStore(
            rootReducer,
            initialState,
            compose(
                applyMiddleware(thunk),
                applyMiddleware(routerMiddl),
            )
        )

    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers');
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}
