// import "babel-polyfill"
import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import NewCourseTemplate from './templates/new-course';
import PurchaseCourse from './templates/purchase-course';
import PurchasePromo from './templates/purchase-promo';
import Registration from './templates/registration';
import {store} from './store/configureStore';
import {Route, Router, Switch} from 'react-router-dom';
import history from "./history";

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Switch >
                <Route exact path={'/mailing/new-course/:courseId'} component={NewCourseTemplate}/>
                <Route exact path={'/mailing/purchase-course/:courseId'} component={PurchaseCourse}/>
                <Route exact path={'/mailing/purchase-promo/:courseId'} component={PurchasePromo}/>
                <Route exact path={'/mailing/registration'} component={Registration}/>
            </Switch>
        </Router>
    </Provider>,
    document.getElementById('root'));