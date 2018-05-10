import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field} from 'redux-form';
import Captcha from './captcha'
import {LoginEdit, SignUpButton} from './editors'

const validate = values => {
    const errors = {}

    if (!values.login) {
        errors.login = 'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.login)) {
        errors.login = 'Invalid email address'
    }
    return errors
}


class PwdRecoveryForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            captcha: null
        }
    }

    static propTypes = {
        onSubmit: PropTypes.func.require,
    };

    _handleSubmit(values) {
        this.props.onSubmit({
            email: values.login,
            'g-recaptcha-response': this.state.captcha
        })
    }

    _onSetCaptcha(value) {
        this.setState({captcha: value});
    }

    _onClearCaptcha() {
        this.setState({captcha: null});
    }

    render() {
        const {invalid, serverError} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        return (
            <div className="register-block-wrapper">
                <span className="register-block-wrapper__label">или</span>
                <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <Field name="login" component={LoginEdit}/>
                    {_errorText}
                    <div className="register-form__buttons">
                        <SignUpButton disabled={invalid || !this.state.captcha} caption={'Отправить'} type={'submit'}/>
                    </div>
                    <Captcha onSetCapture={::this._onSetCaptcha} onClearCaptcha={::this._onClearCaptcha}/>
                </form>
            </div>
        )
    }
}

export default reduxForm({
    form: 'SignInForm',
    validate
})(PwdRecoveryForm);