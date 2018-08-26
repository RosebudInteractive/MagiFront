import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import App from './App';
import {store} from './store/configureStore';
import {Router} from 'react-router-dom';
import ScrollMemory from 'react-router-scroll-memory';
import history from "./history";

ReactDOM.render(
    <div>
        <Provider store={store}>
            <Router history={history}>
                <div>
                    <ScrollMemory/>
                    <App/>
                </div>
            </Router>
        </Provider>
    </div>,
    document.getElementById('root'));