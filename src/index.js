import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
// import {  Router,  } from 'react-router';

import App from './containers/App'
import './styles/app.css'
import "./styles/font-awesome.min.css"
// import { store, history } from './store/configureStore'
import { store } from './store/configureStore'
import { BrowserRouter } from 'react-router-dom'

render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
)

