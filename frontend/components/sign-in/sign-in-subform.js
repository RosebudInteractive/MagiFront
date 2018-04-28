import React from 'react';
import {connect} from 'react-redux';
import Captcha from './captcha'
import {LoginEdit, PasswordEdit, LoginButton} from './editors'

class SignInForm extends React.Component {

    render() {
        return <form action="#" method="post" className="form register-form">
            <LoginEdit/>
            <PasswordEdit/>
            <p class="form__error-message js-error-message">Неправильный пароль</p>
            <LoginButton/>
            <Captcha/>
        </form>
    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
    }
}

export default connect(mapStateToProps)(SignInForm);