import React from 'react';
import PropTypes from 'prop-types';

class Editor extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
    };

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>';

        const {input, meta: {error, touched}, id, type, label, placeholder, disabled, hidden} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        return (
            <div className="form__field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className="form__field-label">{label}</label>
                {disabled ?
                    <input {...input} id={id} type={type} className="form__field" placeholder={placeholder} disabled/>
                    :
                    <input {...input} id={id} type={type} className="form__field" placeholder={placeholder}/>
                }
                {
                    touched ?
                        <span className="status-icon">
                                {error ?
                                    <svg className="failure" width="16" height="16" style={{display: "block"}}
                                         dangerouslySetInnerHTML={{__html: _failure}}/>
                                    :
                                    <svg className="success" width="20" height="20" style={{display: "block"}}
                                         dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                                }
                            </span>
                        :
                        null
                }
                {_errorText}
            </div>
        );
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