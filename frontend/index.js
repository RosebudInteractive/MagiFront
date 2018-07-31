import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import App from './App';
import {store} from './store/configureStore';
import {BrowserRouter} from 'react-router-dom';
import ScrollMemory from 'react-router-scroll-memory';

ReactDOM.render(
    <div>
        <Provider store={store}>
            <BrowserRouter>
                <div>
                    <ScrollMemory/>
                    <App/>
                </div>
            </BrowserRouter>
        </Provider>
    </div>,
    document.getElementById('root'));