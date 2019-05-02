// import "babel-polyfill"
import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import App from './App';
import {store} from './store/configureStore';
import {Router} from 'react-router-dom';
import ScrollMemory from './components/scroll-memory';
import history from "./history";

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <div>
                <ScrollMemory/>
                <App/>
            </div>
        </Router>
    </Provider>,
    document.getElementById('root'));