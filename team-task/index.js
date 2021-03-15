import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './App'
import '../css/webix.css'
import { store } from './redux/configureStore'
import { Router } from 'react-router-dom'
import history from './history'
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

render(
    <Provider store={store}>
        <Router history={history}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <App />
            </MuiPickersUtilsProvider>
        </Router>
    </Provider>,
    document.getElementById('root')
);

