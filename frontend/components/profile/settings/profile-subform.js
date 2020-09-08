import React from 'react';
import PropTypes from 'prop-types';
import {reduxForm, Field, reset, initialize} from 'redux-form';
import ProfileEditor from './profile-editor';

const validate = values => {
    const errors = {}

    if (!values.name) {
        errors.password = 'Required'
    }
    return errors
}

class ProfileSubForm extends React.Component {

    constructor(props) {
        super(props)
    }

    static propTypes = {
        onSubmit: PropTypes.func,
        onSwitchToPassword: PropTypes.func,
        email: PropTypes.string,
        name: PropTypes.string,
    };

    _handleSubmit(values) {
        this.props.onSubmit({
            DisplayName: values.name,
        })
    }

    _cancelChanges() {
        this.props.dispatch(reset('ProfileSubForm'));
    }

    _goToPasswordForm() {
        if (this.props.onSwitchToPassword) {
            this.props.onSwitchToPassword()
        }
    }

    UNSAFE_componentWillMount() {
        this.props.dispatch(initialize('ProfileSubForm', this.props, ['name', 'email']));
    }

    componentDidUpdate(prevProps) {
        let {email, name} = this.props;

        if ((email !== prevProps.email) || (name !== prevProps.name)) {
            this.props.dispatch(initialize('ProfileSubForm', this.props, ['name', 'email']));
            this.props.dispatch(reset('ProfileSubForm'));
        }
    }

    render() {
        const {invalid, serverError, loading, anyTouched} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        let _buttonDisabled = invalid || loading || !anyTouched;

        return (
            <form className="form"
                  onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                <div className="form__row">
                    <Field name="name" component={ProfileEditor} id={"username"} type={"text"}
                           label={"Имя"} wrapperClass={"form__field-wrapper"}/>
                    <Field name="email" component={ProfileEditor} id={"email2"} type={"email"}
                           label={"E-mail"} disabled={true} wrapperClass={"form__field-wrapper"}/>
                    <div className="form__link-wrapper">
                        <button className="form__change-password" type='button'
                                onClick={::this._goToPasswordForm}>Сменить пароль
                        </button>
                    </div>
                </div>
                {_errorText}
                <div className="form__row">
                    <button className={"form__submit btn btn--brown" + (_buttonDisabled ? ' disabled' : '')}
                            type='submit'>Сохранить
                    </button>
                    <input type='reset' className="form__reset-btn" value="Отмена" onClick={::this._cancelChanges}/>
                </div>
            </form>
        )
    }
}

export default reduxForm({
    form: 'ProfileSubForm',
    validate
})(ProfileSubForm);