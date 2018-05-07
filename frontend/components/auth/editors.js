import React from 'react';
import PropTypes from 'prop-types';

// import {Field} from 'redux-form';

export class LoginEdit extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>';

        const {input, meta: {error, touched}} = this.props

        return (
            <div className="form__field-wrapper register-form__field-wrapper">
                <label htmlFor="email" className="form__field-label register-form__field-label">Почта</label>
                <input {...input} id="email" type="email"
                       className="form__field register-form__field" placeholder="Ваш E-mail"/>
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
                            </span> :
                        null
                }

            </div>
        );
    }
}

export class UserNameEdit extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>';

        const {input, meta: {error, touched}} = this.props

        return (
            <div className="form__field-wrapper register-form__field-wrapper">
                <label htmlFor="username" className="form__field-label register-form__field-label">Представьтесь</label>
                <input type="text" id="username" className="form__field register-form__field" placeholder="Ваше имя"/>
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
                            </span> :
                        null
                }
            </div>
        );
    }
}

export class PasswordEdit extends React.Component {

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
            <a href="#" className="register-form__password-recovery">Забыли пароль?</a>
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

    render() {
        return <button className={"btn btn--brown register-form__enter" + (this.props.disabled ? " disabled" : "")}
                       onClick={::this.props.onClick} type={this.props.type}>
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