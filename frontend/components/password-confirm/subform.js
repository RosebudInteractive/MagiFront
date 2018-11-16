import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field} from 'redux-form';
import Captcha from './../auth/captcha'
import {PasswordEdit, SignUpButton} from './../auth/editors'
import PasswordValidator from 'password-validator';

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

    _handleSubmit(values) {
        this.props.onSubmit({
            password: values.password1,
            activationKey: this.props.activationKey,
            'g-recaptcha-response': this.state.captcha
        })
    }

    _onSetCaptcha(value) {
        this.setState({captcha : value});
    }

    _onClearCaptcha() {
        this.setState({captcha : null});
    }

    render() {
        const {invalid, serverError, user, loading} = this.props;
        const _errorText = serverError && <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        return (
            <div className="register-block-wrapper">
                <div className='register-block-wrapper__logo'/>
                <span className="register-block-wrapper__label">{user ? user.DisplayName : ''}</span>
                <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <Field name="password1" component={PasswordEdit} id={'password1'}/>
                    <Field name="password2" component={PasswordEdit} id={'password2'}/>
                    {_errorText}
                    <Captcha onSetCapture={::this._onSetCaptcha} onClearCaptcha={::this._onClearCaptcha}/>
                    <div className="register-form__buttons">
                        <SignUpButton disabled={invalid || !this.state.captcha || loading} caption={'Отправить'}
                                      type={'submit'}/>
                    </div>
                </form>
            </div>
        )
    }
}

export default reduxForm({
    form: 'PasswordConfirmSubform',
    validate
})(PasswordConfirmSubform);