import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import './index.css';
import './assets/css/main.css';
import App from './App';
import {store} from './store/configureStore';
import {BrowserRouter} from 'react-router-dom'

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'));