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
import OurBirthday from "./templates/our-birthday";
import NY22Promo from "./templates/ny22-promo";

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Switch >
                <Route exact path={'/new-course/:courseId'} component={NewCourseTemplate}/>
                <Route exact path={'/purchase-course/:courseId'} component={PurchaseCourse}/>
                <Route exact path={'/purchase-promo/:courseId'} component={PurchasePromo}/>
                <Route exact path={'/registration'} component={Registration}/>
                <Route exact path={'/our-birthday5'} component={OurBirthday}/>
                <Route exact path={'/ny22-promo'} component={NY22Promo}/>
            </Switch>
        </Router>
    </Provider>,
    document.getElementById('root'));
