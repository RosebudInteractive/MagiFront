import React from 'react';
import {reduxForm, Field} from 'redux-form';
import {LoginEdit, PasswordEdit, LoginButton} from '../components/auth/editors'
import Captcha from '../components/auth/captcha'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {userAuthSelector, errorSelector, loadingSelector, login} from "../ducks/auth";

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

let SignInForm = class SignInForm extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            captcha: null
        }

        this._recaptchaInstance = null;
    }

    _handleSubmit(values) {
        this.props.login({
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.serverError)  {
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
        const {invalid, serverError, loading, isUserAuthorized} = this.props;
        const _errorText = serverError && <p className="form__error-message" style={{display: "block"}}>{serverError}</p>

        return (
            <div className={"auth-wrapper" + (!isUserAuthorized ? " opened" : "")}>
                <form className="sign-in-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)} >
                    <Field name="login" component={LoginEdit} id={'email'}/>
                    <Field name="password" component={PasswordEdit}/>
                    {_errorText}
                    <Captcha ref={e => this._recaptchaInstance = e} onSetCapture={::this._onSetCaptcha} onClearCaptcha={::this._onClearCaptcha}/>
                    <LoginButton disabled={invalid || !this.state.captcha || loading} caption={'Войти'}/>
                </form>
            </div>
        )
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        login: bindActionCreators(login, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInForm);