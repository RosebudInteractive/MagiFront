import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './containers/App'
import './styles/app.css'
import "./styles/font-awesome.min.css"
import { store } from './store/configureStore'
import { BrowserRouter } from 'react-router-dom'
import UserConfirmation from "./components/userConfirmation";

const getConfirmation = (message, callback) => {
    render((
        <UserConfirmation message={message} callback={callback} />
    ), document.getElementById('confirm'));
};

render(
    <Provider store={store}>
        <BrowserRouter getUserConfirmation={getConfirmation}>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

