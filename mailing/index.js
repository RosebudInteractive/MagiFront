// import "babel-polyfill"
import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import App from './app';
import {store} from './store/configureStore';
// import {Router} from 'react-router-dom';

ReactDOM.render(
    <Provider store={store}>
        {/*<Router history={history}>*/}
            <App/>
        {/*</Router>*/}
    </Provider>,
    document.getElementById('root'));