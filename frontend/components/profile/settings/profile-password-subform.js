import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field, reset} from 'redux-form';
import ProfileEditor from './profile-editor';
import PasswordValidator from 'password-validator';

let schema = new PasswordValidator();
schema
    .is().min(6)
    .is().max(100)
    .has().not().spaces()

const validate = values => {
    const errors = {}

    if (!values.oldPassword) {
        errors.oldPassword = 'Required'
    }

    if (!values.newPassword) {
        errors.newPassword = 'Required'
    } else if (!schema.validate(values.newPassword)) {
        errors.newPassword = 'Пароль недостаточно надежен'
    }
    if (!values.repeatPassword) {
        errors.repeatPassword = 'Required'
    }

    if (values.newPassword !== values.repeatPassword) {
        errors.repeatPassword = 'Пароли не совпадают'
    }

    return errors
}

class ProfilePasswordSubForm extends React.Component {

    constructor(props) {
        super(props)
    }

    static propTypes = {
        onSubmit: PropTypes.func,
        onSwitchToProfile: PropTypes.func,
    };

    _handleSubmit(values) {
        this.props.onSubmit({
            "Password": values.oldPassword,
            "NewPassword": values.newPassword,
        })
    }

    _cancelChanges() {
        this.props.dispatch(reset('ProfilePasswordSubForm'));
        if (this.props.onSwitchToProfile) {
            this.props.onSwitchToProfile()
        }
    }

    render() {
        const {invalid, serverError, loading, anyTouched} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        let _buttonDisabled = invalid || loading || !anyTouched;

        return (
            <form className="form password-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                <h3 className="password-form__title">Сменить пароль</h3>
                <Field name="oldPassword" component={ProfileEditor} id={"old-password"} type={"password"}
                       label={"Старый пароль"} wrapperClass={"form__field-wrapper password-form__field-wrapper"}/>
                <Field name="newPassword" component={ProfileEditor} id={"new-password"} type={"password"}
                       label={"Новый пароль"} wrapperClass={"form__field-wrapper password-form__field-wrapper"}/>
                <Field name="repeatPassword" component={ProfileEditor} id={"repeat-password"} type={"password"}
                       label={"Повторите новый пароль"}
                       wrapperClass={"form__field-wrapper password-form__field-wrapper"}/>
                {_errorText}
                <div className="form__row _buttons">
                    <button
                        className={"password-form__submit form__submit btn btn--brown" + (_buttonDisabled ? ' disabled' : '')}
                        type={'submit'}>Сменить пароль
                    </button>
                    <input type="reset" className="form__reset-btn password-form__reset-btn" value="Отмена"
                           onClick={::this._cancelChanges}/>
                </div>
            </form>
        )
    }
}

export default reduxForm({
    form: 'ProfilePasswordSubForm',
    validate
})(ProfilePasswordSubForm);