import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './containers/App'
import "./styles/font-awesome.min.css"
import 'adm-styles/general/general.css'
import 'adm-styles/webix/webix.css'
// import 'adm-styles/app.css'
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

