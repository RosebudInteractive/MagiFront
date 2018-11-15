import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field, formValueSelector} from 'redux-form';
import ButtonsBlock from './buttons-block'
import Captcha from './captcha'
import {connect} from 'react-redux'
import PasswordValidator from 'password-validator';
import {LoginEdit, PasswordEdit, UserNameEdit, BackButton, SignUpButton} from './editors'

let schema = new PasswordValidator();
schema
    .is().min(6)
    .is().max(100)
    .has().not().spaces()

const validate = values => {
    const errors = {}

    if (!values.login) {
        errors.login = 'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.login)) {
        errors.login = 'Invalid email address'
    }
    if (!values.username) {
        errors.username = 'Required'
    }
    if (!values.password1) {
        errors.password1 = 'Required'
    } else if (!schema.validate(values.password1)) {
        errors.password1 = 'Пароль недостаточно надежен'
    }
    if (!values.password2) {
        errors.password2 = 'Required'
    }
    if (values.password1 !== values.password2) {
        errors.password2 = 'Пароли не совпадают'
    }
    return errors
}

const screens = {
    email: 'email',
    password: 'password',
}

let SignUpForm = class SignUpForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            screen: screens.email,
            // login: null,
            password1: null,
            password2: null,
            captcha: false
        }
    }

    static propTypes = {
        onSubmit: PropTypes.func.require,
    };

    _handleSubmit(values) {
        this.props.onSubmit({
            login: values.login,
            name: values.username,
            password: values.password1,
            'g-recaptcha-response': this.state.captcha
        })
    }

    _onSetCaptcha(value) {
        this.setState({captcha: value});
    }

    _onClearCaptcha() {
        this.setState({captcha: null});
    }

    _onBackward() {
        this.setState({screen: screens.email})
    }

    _showPasswordScreen() {
        this.setState({screen: screens.password})
    }

    render() {
        const {invalid, serverError, loading} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        return (
            <form className="register-block-wrapper" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                {
                    this.state.screen === screens.email
                        ?
                        [
                            <ButtonsBlock/>,
                            <span className="register-block-wrapper__label">или</span>,
                            <div className="form register-form">,
                                <Field name="login" component={LoginEdit}/>
                                <div className="register-form__buttons">
                                    <SignUpButton disabled={invalid || !this.props.login || loading}
                                                  caption={'Продолжить'}
                                                  onClick={::this._showPasswordScreen}/>
                                </div>
                            </div>
                        ]
                        :
                        <div className="form register-form">
                            <Field name="login" component={LoginEdit} hidden={true}/>
                            <Field name="username" component={UserNameEdit}/>
                            <Field name="password1" component={PasswordEdit}/>
                            <Field name="password2" component={PasswordEdit}/>
                            {_errorText}
                            <Captcha onSetCapture={::this._onSetCaptcha} onClearCaptcha={::this._onClearCaptcha}/>
                            <div className="register-form__buttons">
                                <BackButton onBackward={::this._onBackward}/>
                                <SignUpButton disabled={invalid || !this.state.captcha || loading}
                                              caption={'Зарегистрироваться'} type={'submit'}/>
                            </div>
                        </div>
                }
            </form>
        )


    }
}

SignUpForm = reduxForm({
    form: 'SignUpForm',
    validate
})(SignUpForm)

const selector = formValueSelector('SignUpForm')
SignUpForm = connect(
    state => {
        const login = selector(state, 'login')
        return {login}
    }
)(SignUpForm)

export default SignUpForm;