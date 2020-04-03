// import "babel-polyfill"
import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import Template from './email-template';
import {store} from './store/configureStore';
import {Route, Router} from 'react-router-dom';
import history from "./history";

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route exact path={'/mailing/new-course/:courseId'} component={Template}/>
            <Route exact path={'/mailing/purchase-course/:courseId'} component={Template}/>
            <Route exact path={'/mailing/purchase-promo/:courseId'} component={Template}/>
        </Router>
    </Provider>,
    document.getElementById('root'));