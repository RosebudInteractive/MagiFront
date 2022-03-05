import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field} from 'redux-form';
import {PasswordEdit, SignUpButton} from './../auth/editors'
import PasswordValidator from 'password-validator';
import {reCaptureSelector} from "ducks/app";
import Recaptcha from 'react-google-invisible-recaptcha';
import {connect} from 'react-redux'

let schema = new PasswordValidator();
schema
    .is().min(6)
    .is().max(100)
    .has().not().spaces()

const validate = values => {
    const errors = {}

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


class PasswordConfirmSubform extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            captcha: null
        }
    }

    static propTypes = {
        onSubmit: PropTypes.func.require,
    };

    render() {
        const {invalid, serverError, user, loading} = this.props;
        const _errorText = serverError && <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>
        const _captchaError = this.state.captchaError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>Ошибка проверки captcha</p>

        return (
            <div className="register-block-wrapper">
                <div className='register-block-wrapper__logo'/>
                <span className="register-block-wrapper__label">{user ? user.DisplayName : ''}</span>
                <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <Field name="password1" component={PasswordEdit} id={'password1'} disabled = {!!serverError}/>
                    <Field name="password2" component={PasswordEdit} id={'password2'} disabled = {!!serverError}/>
                    {_errorText}
                    <Recaptcha
                        ref={ ref => this.recaptcha = ref }
                        sitekey={this.props.reCapture}
                        onResolved={ ::this._onResolved }
                        onError={::this._onCaptchaError}/>
                    {_captchaError}
                    <div className="register-form__buttons">
                        <SignUpButton disabled={invalid || loading || !!serverError} caption={'Отправить'}
                                      type={'submit'}/>
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

        if (values.password1) {
            this.setState({
                password: values.password1,
            })
            this.recaptcha.execute();
        } else {
            this.recaptcha.reset();
        }
    }

    _onResolved() {
        this.props.onSubmit({
            password: this.state.password,
            activationKey: this.props.activationKey,
            'g-recaptcha-response': this.recaptcha.getResponse()
        })
    }

    _onCaptchaError() {
        this.setState({
            captchaError: true
        })
    }
}

const _PasswordConfirmSubform = reduxForm({
    form: 'PasswordConfirmSubform',
    validate
})(PasswordConfirmSubform);

function mapStateToProps(state) {
    return {
        reCapture: reCaptureSelector(state),
    }
}

export default connect(mapStateToProps)(_PasswordConfirmSubform)