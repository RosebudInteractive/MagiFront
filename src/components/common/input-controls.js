import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'

class Editor extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        extClass: PropTypes.string
    };

    _checked() {
        return this.props.input.value
    }

    render() {
        const {input, meta: {error, touched}, id, type, label, placeholder, disabled, hidden, extClass,} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        let _inputClass = "field-input" + (extClass ? (' ' + extClass) : '')

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className="field-label">{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    {disabled ?
                        <input {...input} id={id} type={type} className={_inputClass} placeholder={placeholder}
                               checked={this._checked()} disabled/>
                        :
                        <input {...input} id={id} type={type} className={_inputClass} placeholder={placeholder}
                               checked={this._checked()}/>
                    }
                    {_errorText}
                </div>
            </div>
        );
    }
}

export class CheckBox extends Editor {
    static propTypes = {
        label: PropTypes.string,
    }

    render() {
        return <Editor type={'checkbox'} {...this.props} extClass={'field-checkbox'}/>;
    }
}

export class TextBox extends Editor {
    static propTypes = {
        label: PropTypes.string,
    }

    render() {
        return <Editor type={'text'} {...this.props} extClass={'field-text'}/>;
    }
}

export class ImageBox extends Editor {
    static propTypes = {
        label: PropTypes.string,
    }

    render() {
        return <Editor type={'image'} {...this.props} extClass={'field-text'}/>;
    }
}

export class LoginEdit extends Editor {
    render() {
        return <Editor label={'Логин'} placeholder={'Ваш E-mail'} type={'email'} {...this.props}/>;
    }
}

export class PasswordEdit extends Editor {
    render() {
        return <Editor label={'Пароль'} placeholder={'Пароль'} type={'password'} {...this.props}/>;
    }
}

export class LoginButton extends React.Component {

    render() {
        const _login = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login"/>'

        return <div className="register-form__buttons">
            <button className={"btn--brown register-form__enter" + (this.props.disabled ? " disabled" : "")}
                    type={'submit'}>
                <span className="text">{this.props.caption}</span>
                <span className="icon">
                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _login}}/>
                </span>
            </button>
        </div>
    }
}