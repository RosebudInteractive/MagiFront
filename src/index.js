import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './containers/App'
import './styles/app.css'
import "./styles/font-awesome.min.css"
import '../css/general.css'
import '../css/webix.css'
import { store } from './store/configureStore'
import { Router } from 'react-router-dom'
import history from './history'

render(
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);

