import React from 'react';
import {reduxForm, Field, clearSubmitErrors} from 'redux-form';
import {LoginEdit, PasswordEdit, LoginButton} from '../components/auth/editors'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {userAuthSelector, errorSelector, loadingSelector, initializedSelector, login} from "../ducks/auth";
import Recaptcha from 'react-google-invisible-recaptcha';
import {reCaptureSelector, fetchingSelector} from "adm-ducks/app";
import {EMAIL_REGEXP} from "#common/constants/common-consts";

const validate = values => {
    const errors = {}

    if (!values.login) {
        errors.login = 'Не может быть пустым'
    } else if (!EMAIL_REGEXP.test(values.login)) {
        errors.login = 'Недопустимый email'
    }
    if (!values.password) {
        errors.password = 'Не может быть пустым'
    }
    return errors
}

let SignInForm = class SignInForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            captcha: null,
            login: null,
            password: null,
            captchaError: false,
            captchaReloading: false
        }
    }

    _handleSubmit(values) {
        if (this.state.captchaError || this.props.serverError) {
            this.recaptcha.reset();
            this.props.clearSubmitErrors('SignInForm')

            this.setState({
                captchaError: false,
                captchaReloading: true
            })
        }

        if (values.login && values.password) {
            this.setState({
                login: values.login,
                password: values.password,
            })
            this.recaptcha.execute();
        } else {
            this.recaptcha.reset();
        }
    }

    _onResolved() {
        this.setState({
            captchaError: false,
            captchaReloading: false
        })

        this.props.login({
            login: this.state.login,
            password: this.state.password,
            'g-recaptcha-response': this.recaptcha.getResponse()
        })
    }

    componentDidMount() {
        this.props.reset();
    }

    render() {
        const {invalid, serverError, loading, isUserAuthorized, authInitialized, fetching} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message" style={{display: "block"}}>{serverError}</p>

        const _captchaError = this.state.captchaError &&
            <p className="form__error-message" style={{display: "block"}}>Ошибка проверки captcha</p>

        return authInitialized && !fetching ?
            <div className={"auth-wrapper" + (!isUserAuthorized ? " opened" : "")}>
                <form className="sign-in-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <Field name="login" component={LoginEdit} id={'email'}/>
                    <Field name="password" component={PasswordEdit}/>
                    {_errorText}
                    <Recaptcha
                        ref={ ref => this.recaptcha = ref }
                        sitekey={this.props.reCapture}
                        onResolved={ ::this._onResolved }
                        onError={::this._onCaptchaError}/>
                    {_captchaError}
                    <LoginButton disabled={invalid || this.state.captchaReloading || loading} caption={'Войти'}/>
                </form>
            </div>
            :
            null
    }

    _onCaptchaError() {
        this.setState({
            captchaError: true
        })
    }
}

SignInForm = reduxForm({
    form: 'SignInForm',
    validate
})(SignInForm);

function mapStateToProps(state) {
    return {
        isUserAuthorized: userAuthSelector(state),
        serverError: errorSelector(state),
        loading: loadingSelector(state),
        authInitialized: initializedSelector(state),
        reCapture: reCaptureSelector(state),
        fetching: fetchingSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        login: bindActionCreators(login, dispatch),
        clearSubmitErrors: bindActionCreators(clearSubmitErrors, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInForm);
