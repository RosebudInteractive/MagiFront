import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {reduxForm, Field} from 'redux-form';

import * as userActions from '../actions/user-actions'
import {PasswordEdit, SignUpButton} from "../components/auth/editors";

import Captcha from '../components/auth/captcha'

const validate = values => {
    const errors = {}

    if (!values.password1) {
        errors.password1 = 'Required'
    }
    if (!values.password2) {
        errors.password2 = 'Required'
    }
    if (values.password1 !== values.password2) {
        errors.password2 = 'Пароли не совпадают'
    }
    return errors
}

let PasswordConfirmForm = class PasswordConfirmForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            captcha: true
        }
    }

    componentWillMount() {
        this.props.userActions.getActivationUser(this.props.activationKey)
    }

    _handleSubmit(values) {
        this.props.userActions.sendNewPassword({
            password: values.password1,
            activationKey: this.props.activationKey,
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
        let {invalid, error} = this.props;

        let _text = error && <p>{'Произошла ошибка'} <br/>{error}</p>

        return (
            <div className="popup js-popup _registration opened">
                <div className="register-block-wrapper">
                    <form className="form register-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                        <Field name="password1" component={PasswordEdit}/>
                        <Field name="password2" component={PasswordEdit}/>

                        <div className="register-form__buttons">
                            <SignUpButton disabled={invalid || !this.state.captcha} caption={'Отправить'}
                                          type={'submit'}/>
                        </div>
                        {_text}
                        <Captcha onSetCapture={::this._onSetCaptcha} onClearCaptcha={::this._onClearCaptcha}/>
                    </form>
                </div>
            </div>
        )
    }
}

PasswordConfirmForm = reduxForm({
    form: 'PasswordConfirmForm',
    validate
})(PasswordConfirmForm)

function mapStateToProps(state, ownProps) {
    return {
        error: state.user.error,
        user: state.user.user,
        activationKey: ownProps.match.params.activationKey
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordConfirmForm);