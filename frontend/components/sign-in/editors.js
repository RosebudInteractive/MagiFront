import React from 'react';
import {Field} from 'redux-form';

export class LoginEdit extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>'

        return (
            <div className="form__field-wrapper register-form__field-wrapper">
                <label htmlFor="email" className="form__field-label register-form__field-label">Почта</label>
                <Field name='login' component="input" type="email" id="email"
                       className="form__field register-form__field" placeholder="Ваш E-mail"/>
                <span className="status-icon">
                    {this.props.invalid ?
                        <svg className="failure" width="16" height="16"
                             dangerouslySetInnerHTML={{__html: _failure}}/>
                        :
                        <svg className="success" width="20" height="20"
                             dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                    }
                    </span>
            </div>
        );
    }
}

export class PasswordEdit extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>',
            _eye = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#eye"/>'

        return (
            <div className="form__field-wrapper register-form__field-wrapper  js-field-wrapper">
                <label htmlFor="password" className="form__field-label register-form__field-label">Пароль</label>
                <Field name='password' component="input" type="password" id="password"
                       className="form__field register-form__field" placeholder="Пароль"/>
                <span className="icon-eye">
                            <svg width="16" height="12" dangerouslySetInnerHTML={{__html: _eye}}/>
                        </span>

                <span className="status-icon">
                    {this.props.invalid ?
                        <svg className="failure" width="16" height="16"
                             dangerouslySetInnerHTML={{__html: _failure}}/>
                        :
                        <svg className="success" width="20" height="20"
                             dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                    }

                </span>
            </div>
        );
    }
}

export class LoginButton extends React.Component {

    render() {
        const _login = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login"/>'

        return <div className="register-form__buttons">
            <a href="#" className="register-form__password-recovery">Забыли пароль?</a>
            <button className="btn btn--brown register-form__enter" type={'submit'}>
                <span classNaem="text">Войти</span>
                <span className="icon">
                                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _login}}/>
                            </span>
            </button>
        </div>
    }
}