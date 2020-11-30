import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './containers/App'
import "./styles/font-awesome.min.css"
import '../css/general.css'
// import 'webix/webix.css'
import '../css/webix.css'
import { store } from './redux/configureStore'
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

