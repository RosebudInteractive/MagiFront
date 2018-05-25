import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field, reset} from 'redux-form';
import Captcha from './captcha'
import ButtonsBlock from './buttons-block'
import {LoginEdit, PasswordEdit, LoginButton} from './editors'

const validate = values => {
    const errors = {}

    if (!values.login) {
        errors.login = 'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.login)) {
        errors.login = 'Invalid email address'
    }
    if (!values.password) {
        errors.password = 'Required'
    }
    return errors
}

class SignInForm extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            captcha: null
        }

        this._recaptchaInstance = null;
    }

    static propTypes = {
        onSubmit: PropTypes.func.require,
    };

    _handleSubmit(values) {
        this.props.onSubmit({
            login: values.login,
            password: values.password,
            'g-recaptcha-response': this.state.captcha
        })
    }

    _onSetCaptcha(value) {
        this.setState({captcha : value});
    }

    _onClearCaptcha() {
        this.setState({captcha : null});
    }

    componentWillReceiveProps(props) {
        if (props.serverError) {
            this.setState({captcha : null})
            if (this._recaptchaInstance) {
                this._recaptchaInstance.reset();
            }
        }
    }

    componentDidMount() {
        this.props.reset();
        if (this._recaptchaInstance) {
            this._recaptchaInstance.reset();
        }
    }

    render() {
        const {invalid, serverError, loading} = this.props;
        const _errorText = serverError && <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        return (
            <div className="register-block-wrapper">
                <ButtonsBlock/>
                <span className="register-block-wrapper__label">или</span>
                <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)} >
                    <Field name="login" component={LoginEdit} id={'email'}/>
                    <Field name="password" component={PasswordEdit}/>
                    {_errorText}
                    <Captcha ref={e => this._recaptchaInstance = e} onSetCapture={::this._onSetCaptcha} onClearCaptcha={::this._onClearCaptcha}/>
                    <LoginButton disabled={invalid || !this.state.captcha || loading} caption={'Войти'} onStartRecovery={::this.props.onStartRecovery}/>
                </form>
            </div>
        )
    }
}

export default reduxForm({
    form: 'SignInForm',
    validate
})(SignInForm);