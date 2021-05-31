import {createStore, applyMiddleware, compose} from 'redux'
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'

import history from '../history'
import rootReducer from './reducer'
import rootSaga from './saga'
import {attachStore} from "tools/course-discount";

export const store = configureStore()

attachStore(store)

function configureStore(initialState) {
    const _router = routerMiddleware(history);
    const _saga = createSagaMiddleware()

    const store = createStore(
        rootReducer,
        initialState,
        compose(applyMiddleware(_saga),applyMiddleware(thunk), applyMiddleware(_router),)
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
