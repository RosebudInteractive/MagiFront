import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field, change } from 'redux-form';
import {LoginEdit, SignUpButton} from './editors'
import {reCaptureSelector} from "ducks/app";
import Recaptcha from 'react-google-invisible-recaptcha';
import {connect} from 'react-redux'
import {EMAIL_REGEXP} from "../../../common/constants/common-consts";

const validate = values => {
    const errors = {}

    if (!values.login) {
        errors.login = 'Required'
    } else if (!EMAIL_REGEXP.test(values.login)) {
        errors.login = 'Invalid email address'
    }
    return errors
}


class PwdRecoveryForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: null,
            captchaError: false
        }
    }

    static propTypes = {
        onSubmit: PropTypes.func,
        email: PropTypes.string,
    };

    componentDidMount() {
        if (this.props.email)
            this.props.dispatch(change('PasswordRecoveryForm', 'login', this.props.email));
    }

    render() {
        const {invalid, serverError, email} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        const _captchaError = this.state.captchaError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>Ошибка проверки captcha</p>

        return (
            <div className="register-block-wrapper">
                <div className='register-block-wrapper__logo'/>
                <p className="register-block-wrapper__label">Восстановление пароля</p>
                <p className="register-block-wrapper__note">{'Мы пришлем инструкции на ' + (email ? (' почту ' + email) : 'указанный адрес.')}</p>
                <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <Field name="login" component={LoginEdit} id={'email'} disabled={!!email}/>
                    {_errorText}
                    <Recaptcha
                        ref={ ref => this.recaptcha = ref }
                        sitekey={this.props.reCapture}
                        onResolved={ ::this._onResolved }
                        onError={::this._onCaptchaError}/>
                    {_captchaError}
                    <div className="register-form__buttons">
                        <SignUpButton disabled={!email && invalid} caption={'Отправить'} type={'submit'}/>
                    </div>
                </form>
            </div>
        )
    }

    _handleSubmit(values) {
        if (this.state.captchaError) {
            this.setState({
                captchaError: false
            })
        }

        if (values.login) {
            this.setState({
                email: values.login,
            })
            this.recaptcha.execute();
        } else {
            this.recaptcha.reset();
        }
    }

    _onResolved() {
        this.props.onSubmit({
            email: this.state.email,
            'g-recaptcha-response': this.recaptcha.getResponse()
        })
    }

    _onCaptchaError() {
        this.setState({
            captchaError: true
        })
    }
}

const _PwdRecoveryForm = reduxForm({
    form: 'PasswordRecoveryForm',
    validate
})(PwdRecoveryForm);

function mapStateToProps(state) {
    return {
        reCapture: reCaptureSelector(state),
    }
}

export default connect(mapStateToProps)(_PwdRecoveryForm)