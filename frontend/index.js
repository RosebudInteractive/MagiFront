import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import App from './App';
import {store} from './store/configureStore';
import {BrowserRouter} from 'react-router-dom';

ReactDOM.render(
    <div>
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>
    </div>,
    document.getElementById('root'));