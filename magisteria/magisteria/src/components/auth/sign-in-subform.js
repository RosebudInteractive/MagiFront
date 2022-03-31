import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {reduxForm, Field} from 'redux-form';
import ButtonsBlock from './buttons-block'
import {LoginEdit, PasswordEdit, LoginButton} from './editors'
import Warning from "./warning";
import ScrollMemoryStorage from "../../tools/scroll-memory-storage";
import Recaptcha from 'react-google-invisible-recaptcha';
import {reCaptureSelector} from "ducks/app";
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

class SignInForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            captchaError: false,
            captchaReloading: false
        }
    }

    static propTypes = {
        onSubmit: PropTypes.func,
    };

    _handleSubmit(values) {
        if (this.state.captchaError || this.props.serverError) {
            this.recaptcha.reset();

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
        const _scrollPosition = (window.$overflowHandler && window.$overflowHandler.enable) ? window.$overflowHandler.scrollPos : getScrollPage()

        ScrollMemoryStorage.setUrlPosition('INIT', _scrollPosition)
        ScrollMemoryStorage.setKeyActive('INIT')

        this.setState({
            captchaError: false,
            captchaReloading: false
        })

        this.props.onSubmit({
            login: this.state.login,
            password: this.state.password,
            'g-recaptcha-response': this.recaptcha.getResponse()
        })
    }

    render() {
        const {invalid, serverError, loading} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        const _captchaError = this.state.captchaError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>Ошибка проверки captcha</p>

        return (
            <div className="register-block-wrapper">
                <div className='register-block-wrapper__logo'/>
                <ButtonsBlock />
                <span className="register-block-wrapper__label">или</span>
                <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <Field name="login" component={LoginEdit} id={'email'}/>
                    <Field name="password" component={PasswordEdit}/>
                    {_errorText}
                    <Recaptcha
                        ref={ ref => this.recaptcha = ref }
                        sitekey={this.props.reCapture}
                        onResolved={ ::this._onResolved }
                        onError={::this._onCaptchaError}/>
                    {_captchaError}
                    <LoginButton disabled={invalid || this.state.captchaReloading || loading} caption={'Войти'}
                                 onStartRecovery={::this.props.onStartRecovery}/>
                </form>
                <Warning/>
            </div>
        )
    }

    _onCaptchaError() {
        this.setState({
            captchaError: true
        })
    }
}

const  _SignInForm = reduxForm({
    form: 'SignInForm',
    validate
})(SignInForm);

const getScrollPage = () => {
    let docScrollTop = 0;

    if (document.documentElement) {
        docScrollTop = document.documentElement.scrollTop;
    }

    return window.pageYOffset || docScrollTop;
};

function mapStateToProps(state) {
    return {
        reCapture: reCaptureSelector(state),
    }
}

export default connect(mapStateToProps)(_SignInForm)
