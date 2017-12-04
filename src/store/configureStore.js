import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux'

export const store = configureStore()
export const history = syncHistoryWithStore(createBrowserHistory(), store)


function configureStore(initialState) {
    const logger = createLogger()
    const routerMiddl = routerMiddleware(history)

    const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk, logger),
        applyMiddleware(routerMiddl)
    )

    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers')
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}
