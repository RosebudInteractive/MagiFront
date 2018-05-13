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

        const {input, meta: {error, touched}, id, type, label, placeholder} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{error}</p>

        return (
            <div className="form__field-wrapper register-form__field-wrapper">
                <label htmlFor={id} className="form__field-label register-form__field-label">{label}</label>
                <input {...input} id={id} type={type}
                       className="form__field register-form__field" placeholder={placeholder}/>
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
        return <Editor label={'Почта'} placeholder={'Ваш E-mail'} type={'email'} {...this.props}/>;
    }
}

export class UserNameEdit extends Editor{
    render() {
        return <Editor label={'Представьтесь'} placeholder={'Ваше имя'} type={'text'} {...this.props}/>;
    }
}

export class PasswordEdit extends Editor {
    render() {
        return <Editor label={'Пароль'} placeholder={'Пароль'} type={'password'} {...this.props}/>;
    }
}

export class PasswordEditOld extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>',
            _eye = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#eye"/>'

        const {input, meta: {error, touched}} = this.props

        return (
            <div className="form__field-wrapper register-form__field-wrapper  js-field-wrapper">
                <label htmlFor="password" className="form__field-label register-form__field-label">Пароль</label>
                <input {...input} type="password" id="password"
                       className="form__field register-form__field" placeholder="Пароль"/>
                <span className="icon-eye">
                            <svg width="16" height="12" dangerouslySetInnerHTML={{__html: _eye}}/>
                        </span>
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
            </div>
        );
    }
}

export class LoginButton extends React.Component {

    render() {
        const _login = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login"/>'

        return <div className="register-form__buttons">
            <div className="register-form__password-recovery" style={{cursor: "pointer"}}
                 onClick={this.props.onStartRecovery}>Забыли пароль?
            </div>
            <button className={"btn btn--brown register-form__enter" + (this.props.disabled ? " disabled" : "")}
                    type={'submit'}>
                <span className="text">{this.props.caption}</span>
                <span className="icon">
                                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _login}}/>
                            </span>
            </button>
        </div>
    }
}

export class SignUpButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        type: PropTypes.string
    };

    _onClick() {
        if (this.props.onClick) {
            this.props.onClick()
        }
    }

    render() {
        return <button className={"btn btn--brown register-form__enter" + (this.props.disabled ? " disabled" : "")}
                       onClick={::this._onClick} type={this.props.type}>
            <span className="text">{this.props.caption}</span>
        </button>
    }
}

export class BackButton extends React.Component {
    static propTypes = {
        onBackward: PropTypes.func.require,
    };

    render() {
        const _arrowBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arr-back"/>'

        return (
            <div className="register-form__link-back" onClick={::this.props.onBackward}>
                <span className="icon">
                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _arrowBack}}/>
                </span>
            </div>
        )
    }
}