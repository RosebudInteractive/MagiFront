import { createStore, applyMiddleware, compose} from 'redux'
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'react-router-redux'

import history from '../history'
import rootReducer from './reducer'
import rootSaga from './saga'

export const store = configureStore();

function configureStore(initialState) {
    const _router = routerMiddleware(history);
    const _saga = createSagaMiddleware()

    const store = createStore(
        rootReducer,
        initialState,
        compose(applyMiddleware(_saga), applyMiddleware(_router),)
    );

    _saga.run(rootSaga)

    if (module.hot) {
        module.hot.accept('./reducer', () => {
            const nextRootReducer = require('./reducer');
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}
