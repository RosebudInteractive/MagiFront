import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field} from 'redux-form';
import Captcha from './captcha'
import ButtonsBlock from './buttons-block'
import {LoginEdit, PasswordEdit, LoginButton} from './editors'
import Warning from "./warning";
import ScrollMemoryStorage from "../../tools/scroll-memory-storage";

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

    constructor(props) {
        super(props)
        this.state = {
            captcha: null
        }

        this._recaptchaInstance = null;
    }

    static propTypes = {
        onSubmit: PropTypes.func,
    };

    _handleSubmit(values) {
        const _scrollPosition = (window.$overflowHandler && window.$overflowHandler.enable) ? window.$overflowHandler.scrollPos : getScrollPage()

        ScrollMemoryStorage.setUrlPosition('INIT', _scrollPosition)
        ScrollMemoryStorage.setKeyActive('INIT')

        this.props.onSubmit({
            login: values.login,
            password: values.password,
            'g-recaptcha-response': this.state.captcha
        })
    }

    _onSetCaptcha(value) {
        this.setState({captcha: value});
    }

    _onClearCaptcha() {
        this.setState({captcha: null});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.serverError) {
            this.setState({captcha: null})
            Captcha.reset();
        }
    }

    componentDidMount() {
        this.props.reset();
        Captcha.reset();
    }

    render() {
        const {invalid, serverError, loading} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        return (
            <div className="register-block-wrapper">
                <div className='register-block-wrapper__logo'/>
                <ButtonsBlock/>
                <span className="register-block-wrapper__label">или</span>
                <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <Field name="login" component={LoginEdit} id={'email'}/>
                    <Field name="password" component={PasswordEdit}/>
                    {_errorText}
                    <Captcha ref={e => this._recaptchaInstance = e} onSetCapture={::this._onSetCaptcha}
                             onClearCaptcha={::this._onClearCaptcha}/>
                    <LoginButton disabled={invalid || !this.state.captcha || loading} caption={'Войти'}
                                 onStartRecovery={::this.props.onStartRecovery}/>
                </form>
                <Warning/>
            </div>
        )
    }
}

export default reduxForm({
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