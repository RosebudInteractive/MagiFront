import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field, formValueSelector, getFormValues} from 'redux-form';
import ButtonsBlock from './buttons-block'
import Recaptcha from 'react-google-invisible-recaptcha';
import {connect} from 'react-redux'
import PasswordValidator from 'password-validator';
import {LoginEdit, UserNameEdit, BackButton, SignUpButton,} from './editors'
import Warning from "./warning";
import {reCaptureSelector} from "ducks/app";

import PasswordEditor from "./password-editor";
import {EMAIL_REGEXP} from "#common/constants/common-consts";

let schema = new PasswordValidator();
schema
    .is().min(6)
    .is().max(100)
    .has().not().spaces()

const validate = values => {
    const errors = {}

    if (!values.login) {
        errors.login = 'Required'
    } else if (!EMAIL_REGEXP.test(values.login)) {
        errors.login = 'Invalid email address'
    }
    if (!values.username || (values.username.trim() === "")) {
        errors.username = 'Required'
    }
    if (!(values.password1 && values.password1.realPassword)) {
        errors.password1 = 'Required'
    } else if (!schema.validate(values.password1.realPassword)) {
        errors.password1 = 'Пароль недостаточно надежен'
    }
    if (!(values.password2 && values.password2.realPassword)) {
        errors.password2 = 'Required'
    }
    if (values.password1 && values.password2 && (values.password1.realPassword !== values.password2.realPassword)) {
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
            login: null,
            password1: null,
            password2: null,
            captchaError: false
        }
    }

    static propTypes = {
        onSubmit: PropTypes.func.require,
    };

    _handleSubmit(values) {
        if (this.state.captchaError) {
            this.setState({
                captchaError: false
            })
        }

        if (values.login && values.password1 && values.password1.realPassword) {
            this.setState({
                login: values.login,
                name: values.username.trim(),
                password: values.password1.realPassword,
            })
            this.recaptcha.execute();
        } else {
            this.recaptcha.reset();
        }
    }

    _onResolved() {
        this.props.onSubmit({
            login: this.state.login,
            name: this.state.name,
            password: this.state.password,
            'g-recaptcha-response': this.recaptcha.getResponse()
        })
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

        const _captchaError = this.state.captchaError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>Ошибка проверки captcha</p>

        return (
            <form id={"sign-up-form"} className="register-block-wrapper" onSubmit={this.props.handleSubmit(::this._handleSubmit)} autoComplete="off">
                <div className='register-block-wrapper__logo'/>
                {
                    this.state.screen === screens.email
                        ?
                        <React.Fragment>
                            <ButtonsBlock/>
                            <span className="register-block-wrapper__label">или</span>
                            <div className="form register-form">,
                                <Field name="login" component={LoginEdit}/>
                                <div className="register-form__buttons">
                                    <SignUpButton disabled={invalid || !this.props.login || loading}
                                                  caption={'Продолжить'}
                                                  onClick={::this._showPasswordScreen}/>
                                </div>
                            </div>
                        </React.Fragment>
                        :
                        <div className="form register-form">
                            <Field name="login" component={LoginEdit} hidden={true}/>
                            <Field name="username" component={UserNameEdit}/>
                            <Field name="password1" component={PasswordEditor}/>
                            <Field name="password2" component={PasswordEditor}/>
                            {_errorText}
                            <Recaptcha
                                ref={ ref => this.recaptcha = ref }
                                sitekey={this.props.reCapture}
                                onResolved={ ::this._onResolved }
                                onError={::this._onCaptchaError}/>
                            {_captchaError}
                            <div className="register-form__buttons">
                                <BackButton onBackward={::this._onBackward}/>
                                <SignUpButton disabled={invalid || loading} type={"submit"}
                                              caption={'Зарегистрироваться'}/>
                            </div>
                        </div>
                }
                <Warning/>
            </form>
        )
    }

    _onCaptchaError() {
        this.setState({
            captchaError: true
        })
    }
}

let _SignUpForm = reduxForm({
    form: 'SignUpForm',
    validate
})(SignUpForm)

const selector = formValueSelector('SignUpForm')
_SignUpForm = connect(
    state => {
        const login = selector(state, 'login')
        return {login}
    }
)(_SignUpForm)

function mapStateToProps(state) {
    return {
        reCapture: reCaptureSelector(state),
        editorValues: getFormValues('SignUpForm')(state),
    }
}

export default connect(mapStateToProps)(_SignUpForm);
