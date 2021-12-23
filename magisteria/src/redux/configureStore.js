import { createStore, applyMiddleware, compose} from 'redux'
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'react-router-redux'

import history from '../history'
import thunk from 'redux-thunk'
import workShopMiddleware from '../middlewares/work-shop-middleware'
import ButtonsMiddleware from '../middlewares/buttons-middleware'
import ParamsMiddleware from '../middlewares/params-middleware'

import rootReducer from '../reducers'
import rootSaga from './saga'

export const store = configureStore();

function configureStore(initialState) {
    const routerMiddl = routerMiddleware(history);
    const sagaMiddleware = createSagaMiddleware()

    const store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(sagaMiddleware),
            applyMiddleware(thunk),
            applyMiddleware(routerMiddl),
            applyMiddleware(workShopMiddleware),
            applyMiddleware(ButtonsMiddleware),
            applyMiddleware(ParamsMiddleware),
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
