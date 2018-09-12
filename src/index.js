import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './containers/App'
// import './styles/app.css'
// import "./styles/font-awesome.min.css"
import { store } from './store/configureStore'
import { Router } from 'react-router-dom'
import UserConfirmation from "./components/userConfirmation";
import history from './history'

const getConfirmation = (message, callback) => {
    render((
        <UserConfirmation message={message} callback={callback} />
    ), document.getElementById('confirm'));
};

render(
    <Provider store={store}>
        <Router getUserConfirmation={getConfirmation} history={history}>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);

