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
import { IntlProvider } from 'rsuite';
import ruRU from 'rsuite/lib/IntlProvider/locales/ru_RU';
import format from 'date-fns/format';
import ru from 'date-fns/locale/ru';

function formatDate(data, formatStr) {
    return format(data, 'dd.MM.yyyy', { locale: ru });
}

render(
    <Provider store={store}>
        <Router history={history}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <IntlProvider locale={ruRU} formatDate={formatDate}>
                {/*<IntlProvider locale={ruRU}>*/}
                    <App />
                </IntlProvider>
            </MuiPickersUtilsProvider>
        </Router>
    </Provider>,
    document.getElementById('root')
);

