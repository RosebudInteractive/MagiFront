import React from 'react';
import { reduxForm, Field } from 'redux-form';
import Captcha from './captcha'
import {LoginEdit, PasswordEdit, LoginButton} from './editors'
// import * as userActions from '../../actions/user-actions'


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

    _handleSubmit(values) {
        console.log(values)
    }

    render() {
        return <form className="form register-form" onSubmit={this._handleSubmit}>
            <Field name = "login" component = {LoginEdit}/>
            {/*<LoginEdit {...this.props}/>*/}
            <Field name = "login" component = {PasswordEdit}/>
            {/*<PasswordEdit {...this.props}/>*/}
            <p className="form__error-message js-error-message">Неправильный пароль</p>
            <LoginButton/>
            <Captcha/>
        </form>
    }
}

export default reduxForm({
    form: 'SignInForm',
    validate
})(SignInForm);

// function mapStateToProps(state) {
//     return {
//         authorizationState: state.user.authorizationState,
//     }
// }
//
// function mapDispatchToProps(dispatch) {
//     return {
//         userActions: bindActionCreators(userActions, dispatch),
//     }
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(SignInForm);